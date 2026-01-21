"""
SSH executor for running remote commands on the VPS
"""

import paramiko
import logging
import time
from typing import Tuple, Optional

logger = logging.getLogger(__name__)


class SSHExecutor:
    """Execute commands remotely via SSH without uploading scripts"""
    
    def __init__(self, host: str, username: str, password: str, port: int = 22):
        self.host = host
        self.username = username
        self.password = password
        self.port = port
        self.client: Optional[paramiko.SSHClient] = None
        self.connected = False
    
    def connect(self, timeout: int = 30) -> bool:
        """Establish SSH connection"""
        try:
            self.client = paramiko.SSHClient()
            # Note: Using AutoAddPolicy for convenience in rescue system scenarios
            # where host keys may change frequently. In production, consider using
            # a more restrictive policy or validating host keys explicitly.
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.client.connect(
                self.host,
                port=self.port,
                username=self.username,
                password=self.password,
                timeout=timeout,
                look_for_keys=False,
                allow_agent=False
            )
            self.connected = True
            logger.info(f"Connected to {self.host}")
            return True
        except Exception as e:
            logger.error(f"Connection failed: {e}")
            self.connected = False
            return False
    
    def disconnect(self):
        """Close SSH connection"""
        if self.client:
            self.client.close()
            self.connected = False
            logger.info("Disconnected")
    
    def execute_command(self, command: str, timeout: int = 300) -> Tuple[int, str, str]:
        """
        Execute a single command remotely
        Returns: (exit_code, stdout, stderr)
        """
        if not self.connected or not self.client:
            raise Exception("Not connected to VPS")
        
        try:
            logger.info(f"Executing: {command[:100]}...")
            stdin, stdout, stderr = self.client.exec_command(
                f"bash -lc '{command}'",
                timeout=timeout
            )
            
            exit_code = stdout.channel.recv_exit_status()
            stdout_text = stdout.read().decode('utf-8', errors='ignore')
            stderr_text = stderr.read().decode('utf-8', errors='ignore')
            
            logger.info(f"Exit code: {exit_code}")
            if stdout_text:
                logger.debug(f"stdout: {stdout_text[:200]}")
            if stderr_text:
                logger.debug(f"stderr: {stderr_text[:200]}")
            
            return exit_code, stdout_text, stderr_text
            
        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            raise
    
    def execute_command_with_progress(self, command: str, timeout: int = 600) -> Tuple[int, str, str]:
        """
        Execute a command that may take longer and capture output progressively
        """
        if not self.connected or not self.client:
            raise Exception("Not connected to VPS")
        
        try:
            logger.info(f"Executing with progress: {command[:100]}...")
            stdin, stdout, stderr = self.client.exec_command(
                f"bash -lc '{command}'",
                timeout=timeout,
                get_pty=True
            )
            
            # Read output as it comes
            output_lines = []
            while not stdout.channel.exit_status_ready():
                if stdout.channel.recv_ready():
                    line = stdout.channel.recv(4096).decode('utf-8', errors='ignore')
                    output_lines.append(line)
                time.sleep(0.1)
            
            # Get remaining output
            while stdout.channel.recv_ready():
                line = stdout.channel.recv(4096).decode('utf-8', errors='ignore')
                output_lines.append(line)
            
            exit_code = stdout.channel.recv_exit_status()
            stdout_text = ''.join(output_lines)
            stderr_text = stderr.read().decode('utf-8', errors='ignore')
            
            return exit_code, stdout_text, stderr_text
            
        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            raise
    
    def file_exists(self, path: str) -> bool:
        """Check if a file exists on remote system"""
        exit_code, _, _ = self.execute_command(f"test -f {path} && echo 'exists' || echo 'not found'")
        return exit_code == 0
    
    def get_command_output(self, command: str, timeout: int = 60) -> str:
        """Execute command and return stdout only"""
        exit_code, stdout, stderr = self.execute_command(command, timeout)
        if exit_code != 0:
            raise Exception(f"Command failed: {stderr}")
        return stdout.strip()

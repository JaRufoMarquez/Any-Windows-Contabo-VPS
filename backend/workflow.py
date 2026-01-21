"""
Workflow engine for executing Windows installation steps
Converts windows-install.sh logic into discrete remote commands
"""

import logging
import time
from typing import Optional, Dict, Any, List
from enum import Enum
import re

from ssh_executor import SSHExecutor

logger = logging.getLogger(__name__)


class StepStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    WAITING_INPUT = "waiting_input"


class WorkflowStep:
    """Represents a single workflow step"""
    
    def __init__(self, id: str, name: str, description: str):
        self.id = id
        self.name = name
        self.description = description
        self.status = StepStatus.PENDING
        self.error: Optional[str] = None
        self.output: Optional[str] = None
        self.prompt: Optional[Dict[str, Any]] = None


class WorkflowJob:
    """Container for workflow and SSH connection"""
    
    def __init__(self, id: str, workflow: 'WorkflowEngine', ssh: SSHExecutor):
        self.id = id
        self.workflow = workflow
        self.ssh = ssh


class WorkflowEngine:
    """Executes the Windows installation workflow step by step"""
    
    def __init__(self, ssh: SSHExecutor, job_id: str):
        self.ssh = ssh
        self.job_id = job_id
        self.steps: List[WorkflowStep] = []
        self.current_step_index = 0
        self.user_input: Optional[str] = None
        self.waiting_for_input = False
        self._initialize_steps()
    
    def _initialize_steps(self):
        """Initialize all workflow steps"""
        self.steps = [
            WorkflowStep("update", "System Update", "Update and upgrade system packages"),
            WorkflowStep("install_kernel", "Install Kernel", "Install linux-image-amd64"),
            WorkflowStep("reinstall_initramfs", "Reinstall Initramfs", "Reinstall initramfs-tools"),
            WorkflowStep("install_tools", "Install Tools", "Install grub2, wimtools, ntfs-3g, gdisk"),
            WorkflowStep("confirm_disk", "Confirm Disk Operations", "WARNING: This will erase all data on /dev/sda"),
            WorkflowStep("partition_disk", "Partition Disk", "Create GPT partition table and partitions"),
            WorkflowStep("format_partitions", "Format Partitions", "Format partitions as NTFS"),
            WorkflowStep("configure_gdisk", "Configure GDISK", "Run gdisk protective MBR commands"),
            WorkflowStep("mount_partitions", "Mount Partitions", "Mount partitions for installation"),
            WorkflowStep("install_grub", "Install GRUB", "Install and configure GRUB bootloader"),
            WorkflowStep("windows_iso", "Windows ISO", "Download or upload Windows installation ISO"),
            WorkflowStep("copy_windows", "Copy Windows Files", "Mount and copy Windows installation files"),
            WorkflowStep("virtio_iso", "Virtio Drivers ISO", "Download or upload Virtio drivers ISO"),
            WorkflowStep("copy_virtio", "Copy Virtio Drivers", "Mount and copy Virtio driver files"),
            WorkflowStep("select_wim_image", "Select WIM Image", "Select Windows image from boot.wim"),
            WorkflowStep("update_wim", "Update WIM", "Update boot.wim with Virtio drivers"),
            WorkflowStep("confirm_reboot", "Confirm Reboot", "Ready to reboot into Windows installer"),
            WorkflowStep("reboot", "Reboot System", "Reboot VPS to start Windows installation"),
        ]
    
    def get_status(self) -> Dict[str, Any]:
        """Get current workflow status"""
        current_step = None
        if self.current_step_index < len(self.steps):
            step = self.steps[self.current_step_index]
            current_step = {
                "id": step.id,
                "name": step.name,
                "description": step.description,
                "status": step.status,
                "error": step.error,
                "prompt": step.prompt
            }
        
        return {
            "job_id": self.job_id,
            "current_step": current_step,
            "total_steps": len(self.steps),
            "completed_steps": sum(1 for s in self.steps if s.status == StepStatus.COMPLETED),
            "steps": [
                {
                    "id": s.id,
                    "name": s.name,
                    "status": s.status,
                    "error": s.error
                }
                for s in self.steps
            ],
            "waiting_for_input": self.waiting_for_input
        }
    
    def provide_input(self, value: str):
        """Provide user input for waiting step"""
        self.user_input = value
        self.waiting_for_input = False
    
    def _wait_for_input(self, prompt: Dict[str, Any]) -> str:
        """Wait for user input"""
        step = self.steps[self.current_step_index]
        step.status = StepStatus.WAITING_INPUT
        step.prompt = prompt
        self.waiting_for_input = True
        
        # Poll for input
        timeout = 3600  # 1 hour timeout
        start_time = time.time()
        while self.waiting_for_input:
            if time.time() - start_time > timeout:
                raise Exception("Input timeout")
            time.sleep(1)
        
        return self.user_input
    
    def run(self):
        """Execute the workflow"""
        try:
            logger.info(f"Starting workflow for job {self.job_id}")
            
            for index, step in enumerate(self.steps):
                self.current_step_index = index
                step.status = StepStatus.RUNNING
                
                try:
                    logger.info(f"Executing step: {step.name}")
                    self._execute_step(step)
                    step.status = StepStatus.COMPLETED
                    logger.info(f"Completed step: {step.name}")
                    
                except Exception as e:
                    logger.error(f"Step {step.name} failed: {e}")
                    step.status = StepStatus.FAILED
                    step.error = str(e)
                    break
            
            logger.info(f"Workflow completed for job {self.job_id}")
            
        except Exception as e:
            logger.error(f"Workflow failed: {e}")
        finally:
            # Keep connection open for status checks
            pass
    
    def _execute_step(self, step: WorkflowStep):
        """Execute a specific workflow step"""
        
        if step.id == "update":
            self._step_update()
        elif step.id == "install_kernel":
            self._step_install_kernel()
        elif step.id == "reinstall_initramfs":
            self._step_reinstall_initramfs()
        elif step.id == "install_tools":
            self._step_install_tools()
        elif step.id == "confirm_disk":
            self._step_confirm_disk()
        elif step.id == "partition_disk":
            self._step_partition_disk()
        elif step.id == "format_partitions":
            self._step_format_partitions()
        elif step.id == "configure_gdisk":
            self._step_configure_gdisk()
        elif step.id == "mount_partitions":
            self._step_mount_partitions()
        elif step.id == "install_grub":
            self._step_install_grub()
        elif step.id == "windows_iso":
            self._step_windows_iso()
        elif step.id == "copy_windows":
            self._step_copy_windows()
        elif step.id == "virtio_iso":
            self._step_virtio_iso()
        elif step.id == "copy_virtio":
            self._step_copy_virtio()
        elif step.id == "select_wim_image":
            self._step_select_wim_image()
        elif step.id == "update_wim":
            self._step_update_wim()
        elif step.id == "confirm_reboot":
            self._step_confirm_reboot()
        elif step.id == "reboot":
            self._step_reboot()
    
    def _step_update(self):
        """Update and upgrade system"""
        exit_code, stdout, stderr = self.ssh.execute_command(
            "apt update -y && apt upgrade -y",
            timeout=600
        )
        if exit_code != 0:
            raise Exception(f"System update failed: {stderr}")
    
    def _step_install_kernel(self):
        """Install linux kernel"""
        exit_code, stdout, stderr = self.ssh.execute_command(
            "DEBIAN_FRONTEND=noninteractive apt install -y linux-image-amd64",
            timeout=600
        )
        if exit_code != 0:
            raise Exception(f"Kernel installation failed: {stderr}")
    
    def _step_reinstall_initramfs(self):
        """Reinstall initramfs-tools"""
        exit_code, stdout, stderr = self.ssh.execute_command(
            "DEBIAN_FRONTEND=noninteractive apt install --reinstall -y initramfs-tools",
            timeout=300
        )
        if exit_code != 0:
            raise Exception(f"Initramfs reinstall failed: {stderr}")
    
    def _step_install_tools(self):
        """Install required tools"""
        exit_code, stdout, stderr = self.ssh.execute_command(
            "DEBIAN_FRONTEND=noninteractive apt install -y grub2 wimtools ntfs-3g gdisk",
            timeout=600
        )
        if exit_code != 0:
            raise Exception(f"Tools installation failed: {stderr}")
    
    def _step_confirm_disk(self):
        """Ask user to confirm destructive disk operations"""
        user_response = self._wait_for_input({
            "type": "confirm",
            "title": "⚠️ WARNING: Destructive Operation",
            "message": "This will ERASE ALL DATA on /dev/sda and create new partitions. This action cannot be undone.",
            "options": ["confirm", "cancel"]
        })
        
        if user_response.lower() != "confirm":
            raise Exception("User cancelled disk operations")
    
    def _step_partition_disk(self):
        """Create partitions on disk"""
        # Get disk size (extract numeric value without units)
        disk_size_output = self.ssh.get_command_output(
            "parted /dev/sda --script print | awk '/^Disk \\/dev\\/sda:/ {gsub(/[^0-9]/, \"\", $3); print $3}'"
        )
        try:
            disk_size_gb = int(disk_size_output)
        except ValueError:
            # Fallback: try to extract just the numeric part
            import re
            match = re.search(r'(\d+)', disk_size_output)
            if match:
                disk_size_gb = int(match.group(1))
            else:
                raise Exception(f"Could not parse disk size from: {disk_size_output}")
        
        disk_size_mb = disk_size_gb * 1024
        part_size_mb = disk_size_mb // 2
        
        # Create GPT partition table
        self.ssh.execute_command("parted /dev/sda --script -- mklabel gpt")
        
        # Create partitions
        self.ssh.execute_command(
            f"parted /dev/sda --script -- mkpart primary ntfs 1MB {part_size_mb}MB"
        )
        self.ssh.execute_command(
            f"parted /dev/sda --script -- mkpart primary ntfs {part_size_mb}MB 100%"
        )
        
        # Inform kernel and wait for partition table changes to propagate
        # Multiple retries with delays are necessary as the kernel needs time
        # to recognize the new partition table and create device nodes
        PARTITION_PROBE_RETRIES = 3
        PARTITION_PROBE_DELAY = 60  # seconds
        
        for i in range(PARTITION_PROBE_RETRIES):
            self.ssh.execute_command("partprobe /dev/sda")
            time.sleep(PARTITION_PROBE_DELAY)
        
        # Verify partitions
        exit_code, _, _ = self.ssh.execute_command("lsblk /dev/sda1 && lsblk /dev/sda2")
        if exit_code != 0:
            raise Exception("Partitions were not created successfully")
    
    def _step_format_partitions(self):
        """Format partitions as NTFS"""
        exit_code1, _, stderr1 = self.ssh.execute_command("mkfs.ntfs -f /dev/sda1", timeout=300)
        exit_code2, _, stderr2 = self.ssh.execute_command("mkfs.ntfs -f /dev/sda2", timeout=300)
        
        if exit_code1 != 0 or exit_code2 != 0:
            raise Exception(f"Formatting failed: {stderr1} {stderr2}")
    
    def _step_configure_gdisk(self):
        """Configure protective MBR with gdisk"""
        exit_code, stdout, stderr = self.ssh.execute_command(
            "echo -e 'r\\ng\\np\\nw\\nY\\n' | gdisk /dev/sda"
        )
        # gdisk may return non-zero even on success, check output
        if "Disk identifiers are present" not in stdout and exit_code != 0:
            logger.warning(f"gdisk output: {stdout}")
    
    def _step_mount_partitions(self):
        """Mount partitions"""
        # Mount /dev/sda1 to /mnt
        self.ssh.execute_command("mount /dev/sda1 /mnt")
        
        # Create and mount windisk directory
        self.ssh.execute_command("mkdir -p /root/windisk")
        self.ssh.execute_command("mount /dev/sda2 /root/windisk")
    
    def _step_install_grub(self):
        """Install and configure GRUB"""
        # Install GRUB
        exit_code, stdout, stderr = self.ssh.execute_command(
            "grub-install --root-directory=/mnt /dev/sda"
        )
        if exit_code != 0:
            raise Exception(f"GRUB installation failed: {stderr}")
        
        # Create GRUB configuration
        grub_config = """menuentry "windows installer" {
	insmod ntfs
	search --no-floppy --set=root --file=/bootmgr
	ntldr /bootmgr
	boot
}"""
        
        # Escape quotes for shell
        escaped_config = grub_config.replace("'", "'\\''")
        self.ssh.execute_command(f"echo '{escaped_config}' > /mnt/boot/grub/grub.cfg")
        
        # Create winfile directory
        self.ssh.execute_command("mkdir -p /root/windisk/winfile")
    
    def _step_windows_iso(self):
        """Handle Windows ISO download or upload"""
        user_response = self._wait_for_input({
            "type": "choice",
            "title": "Windows ISO",
            "message": "How would you like to provide the Windows installation ISO?",
            "options": [
                {"value": "download", "label": "Download from URL"},
                {"value": "upload", "label": "I will upload it manually"}
            ]
        })
        
        if user_response == "download":
            url = self._wait_for_input({
                "type": "text",
                "title": "Windows ISO URL",
                "message": "Enter the URL to download Windows.iso",
                "default": "https://bit.ly/3UGzNcB",
                "placeholder": "https://example.com/Windows.iso"
            })
            
            if not url:
                url = "https://bit.ly/3UGzNcB"
            
            # Download ISO
            exit_code, stdout, stderr = self.ssh.execute_command_with_progress(
                f'cd /root/windisk && wget -O Windows.iso --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "{url}"',
                timeout=3600
            )
            if exit_code != 0:
                raise Exception(f"Download failed: {stderr}")
        else:
            self._wait_for_input({
                "type": "info",
                "title": "Upload Instructions",
                "message": "Please upload the Windows.iso file to /root/windisk/ on the VPS using SCP or SFTP, then click Continue.",
                "action": "continue"
            })
        
        # Verify ISO exists
        if not self.ssh.file_exists("/root/windisk/Windows.iso"):
            raise Exception("Windows.iso not found in /root/windisk/")
    
    def _step_copy_windows(self):
        """Mount and copy Windows files"""
        # Mount ISO
        self.ssh.execute_command("mount -o loop /root/windisk/Windows.iso /root/windisk/winfile")
        
        # Copy files
        exit_code, stdout, stderr = self.ssh.execute_command_with_progress(
            "rsync -avz --progress /root/windisk/winfile/* /mnt",
            timeout=1800
        )
        
        # Unmount
        self.ssh.execute_command("umount /root/windisk/winfile")
        
        if exit_code != 0:
            raise Exception(f"Copying Windows files failed: {stderr}")
    
    def _step_virtio_iso(self):
        """Handle Virtio drivers ISO"""
        user_response = self._wait_for_input({
            "type": "choice",
            "title": "Virtio Drivers ISO",
            "message": "How would you like to provide the Virtio drivers ISO?",
            "options": [
                {"value": "download", "label": "Download from URL"},
                {"value": "upload", "label": "I will upload it manually"}
            ]
        })
        
        if user_response == "download":
            url = self._wait_for_input({
                "type": "text",
                "title": "Virtio ISO URL",
                "message": "Enter the URL to download Virtio.iso",
                "default": "https://bit.ly/4d1g7Ht",
                "placeholder": "https://example.com/Virtio.iso"
            })
            
            if not url:
                url = "https://bit.ly/4d1g7Ht"
            
            # Download ISO
            exit_code, stdout, stderr = self.ssh.execute_command_with_progress(
                f'cd /root/windisk && wget -O Virtio.iso --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "{url}"',
                timeout=1800
            )
            if exit_code != 0:
                raise Exception(f"Download failed: {stderr}")
        else:
            self._wait_for_input({
                "type": "info",
                "title": "Upload Instructions",
                "message": "Please upload the Virtio.iso file to /root/windisk/ on the VPS using SCP or SFTP, then click Continue.",
                "action": "continue"
            })
        
        # Verify ISO exists
        if not self.ssh.file_exists("/root/windisk/Virtio.iso"):
            raise Exception("Virtio.iso not found in /root/windisk/")
    
    def _step_copy_virtio(self):
        """Mount and copy Virtio drivers"""
        # Mount ISO
        self.ssh.execute_command("mount -o loop /root/windisk/Virtio.iso /root/windisk/winfile")
        
        # Create directory
        self.ssh.execute_command("mkdir -p /mnt/sources/virtio")
        
        # Copy files
        exit_code, stdout, stderr = self.ssh.execute_command_with_progress(
            "rsync -avz --progress /root/windisk/winfile/* /mnt/sources/virtio",
            timeout=1800
        )
        
        # Unmount
        self.ssh.execute_command("umount /root/windisk/winfile")
        
        if exit_code != 0:
            raise Exception(f"Copying Virtio drivers failed: {stderr}")
    
    def _step_select_wim_image(self):
        """List WIM images and get user selection"""
        # Get WIM info
        wim_info = self.ssh.get_command_output(
            "cd /mnt/sources && wimlib-imagex info boot.wim"
        )
        
        # Parse image indices and names
        images = []
        current_index = None
        current_name = None
        
        for line in wim_info.split('\n'):
            if line.startswith('Index:'):
                if current_index and current_name:
                    images.append({"index": current_index, "name": current_name})
                current_index = line.split(':')[1].strip()
                current_name = None
            elif line.startswith('Name:'):
                current_name = line.split(':', 1)[1].strip()
        
        if current_index and current_name:
            images.append({"index": current_index, "name": current_name})
        
        if not images:
            raise Exception("No images found in boot.wim")
        
        # Present choices to user
        image_index = self._wait_for_input({
            "type": "select",
            "title": "Select Windows Image",
            "message": "Choose the Windows image to install:",
            "options": [
                {"value": img["index"], "label": f"{img['index']}: {img['name']}"}
                for img in images
            ],
            "wim_info": wim_info
        })
        
        # Store for next step
        self.selected_image_index = image_index
    
    def _step_update_wim(self):
        """Update boot.wim with Virtio drivers"""
        # Create cmd.txt
        self.ssh.execute_command("echo 'add virtio /virtio_drivers' > /mnt/sources/cmd.txt")
        
        # Update WIM
        image_index = getattr(self, 'selected_image_index', '1')
        exit_code, stdout, stderr = self.ssh.execute_command(
            f"cd /mnt/sources && wimlib-imagex update boot.wim {image_index} < cmd.txt",
            timeout=600
        )
        
        if exit_code != 0:
            raise Exception(f"WIM update failed: {stderr}")
    
    def _step_confirm_reboot(self):
        """Confirm reboot"""
        user_response = self._wait_for_input({
            "type": "confirm",
            "title": "Ready to Reboot",
            "message": "Installation is complete! The system will reboot into the Windows installer. The SSH connection will be lost. Continue?",
            "options": ["reboot", "cancel"]
        })
        
        if user_response.lower() != "reboot":
            raise Exception("User cancelled reboot")
    
    def _step_reboot(self):
        """Reboot the system"""
        try:
            # Execute reboot - connection will be lost
            self.ssh.execute_command("reboot", timeout=5)
        except Exception as e:
            # Expected to lose connection
            logger.info(f"Reboot initiated, connection lost (expected): {e}")

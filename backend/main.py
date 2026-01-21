"""
Web-based Windows Installer Backend for Contabo VPS
This application provides a REST API to execute the Windows installation workflow
remotely via SSH without uploading scripts to the VPS.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uuid
import logging

from workflow import WorkflowEngine, WorkflowJob
from ssh_executor import SSHExecutor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Windows Installer API", version="1.0.0")

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job storage
jobs: Dict[str, WorkflowJob] = {}


class ConnectionRequest(BaseModel):
    host: str
    username: str = "root"
    password: str
    port: int = 22


class JobResponse(BaseModel):
    job_id: str
    status: str


class UserInputRequest(BaseModel):
    value: str


@app.get("/")
async def root():
    return {"message": "Windows Installer API", "status": "running"}


@app.post("/api/jobs", response_model=JobResponse)
async def create_job(connection: ConnectionRequest, background_tasks: BackgroundTasks):
    """Create a new installation job"""
    try:
        # Validate connection
        ssh = SSHExecutor(
            host=connection.host,
            username=connection.username,
            password=connection.password,
            port=connection.port
        )
        
        # Test connection
        if not ssh.connect():
            raise HTTPException(status_code=400, detail="Failed to connect to VPS. Please check credentials.")
        
        # Create job
        job_id = str(uuid.uuid4())
        workflow = WorkflowEngine(ssh, job_id)
        job = WorkflowJob(
            id=job_id,
            workflow=workflow,
            ssh=ssh
        )
        jobs[job_id] = job
        
        # Start workflow in background
        background_tasks.add_task(workflow.run)
        
        logger.info(f"Created job {job_id} for host {connection.host}")
        
        return JobResponse(job_id=job_id, status="started")
        
    except Exception as e:
        logger.error(f"Error creating job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get the status of a job"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    return job.workflow.get_status()


@app.post("/api/jobs/{job_id}/input")
async def provide_input(job_id: str, user_input: UserInputRequest):
    """Provide user input for a waiting job"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    job.workflow.provide_input(user_input.value)
    return {"status": "input_received"}


@app.delete("/api/jobs/{job_id}")
async def cancel_job(job_id: str):
    """Cancel a running job"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    job.ssh.disconnect()
    del jobs[job_id]
    
    logger.info(f"Cancelled job {job_id}")
    return {"status": "cancelled"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "active_jobs": len(jobs)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Backend - Windows Installer API

FastAPI backend for the Windows installer web application.

## Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - API status
- `GET /health` - Health check
- `POST /api/jobs` - Create new installation job
- `GET /api/jobs/{job_id}` - Get job status
- `POST /api/jobs/{job_id}/input` - Provide user input
- `DELETE /api/jobs/{job_id}` - Cancel job

## Architecture

- `main.py` - FastAPI application and routes
- `workflow.py` - Workflow engine with installation steps
- `ssh_executor.py` - SSH command execution
- `requirements.txt` - Python dependencies

## Security

- Passwords are stored in memory only
- No data persistence between restarts
- SSH connections use timeout protection
- All dependencies scanned for vulnerabilities

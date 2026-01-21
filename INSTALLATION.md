# Running the Web Installer

## Quick Start

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application at `http://localhost` or `http://YOUR_SERVER_IP`

### Manual Setup

#### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev  # Development mode
# OR
npm run build  # Production build
```

## Environment Variables

### Backend
- `HOST`: Backend host (default: 0.0.0.0)
- `PORT`: Backend port (default: 8000)

### Frontend
- `VITE_API_URL`: Backend API URL (default: /api)

## Troubleshooting

### Backend Issues

**Problem**: SSH connection fails
- Verify VPS is in Rescue mode
- Check IP address and port
- Verify password is correct
- Ensure VPS firewall allows SSH (port 22)

**Problem**: Commands timeout
- Some operations (downloads, formatting) can take a long time
- Check VPS network connection
- Verify disk has sufficient space

### Frontend Issues

**Problem**: Can't connect to backend
- Verify backend is running on port 8000
- Check browser console for errors
- Ensure proxy configuration in vite.config.js is correct

**Problem**: UI not updating
- Check browser console for JavaScript errors
- Verify API polling is working
- Clear browser cache and reload

### Docker Issues

**Problem**: Containers won't start
- Run `docker-compose logs` to see errors
- Verify ports 80 and 8000 are not already in use
- Check Docker daemon is running

**Problem**: Can't access web interface
- Verify containers are running: `docker-compose ps`
- Check firewall allows port 80
- Try accessing via http://localhost

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

The development server will proxy API requests to http://localhost:8000

## Production Deployment

### With Docker
```bash
docker-compose up -d
```

### Without Docker

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Serve with nginx or similar web server

3. Run backend:
```bash
cd backend
pip install -r requirements.txt
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Security Recommendations

For production use:

1. **Use HTTPS**: Configure nginx/Apache as reverse proxy with SSL
2. **Add authentication**: Implement user authentication
3. **Network isolation**: Restrict access to trusted networks
4. **Rate limiting**: Add rate limiting to prevent abuse
5. **Input validation**: Backend validates all inputs
6. **Logging**: Enable detailed logging for debugging

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## License

This project is open source. See LICENSE file for details.

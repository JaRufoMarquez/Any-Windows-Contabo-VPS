# Contributing to Windows Installer for Contabo VPS

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose (optional)

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Any-Windows-Contabo-VPS.git
   cd Any-Windows-Contabo-VPS
   ```

3. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

## Making Changes

### Code Style

- **Python**: Follow PEP 8 guidelines
- **JavaScript/React**: Use consistent formatting with Prettier (if configured)
- Add comments for complex logic
- Keep functions small and focused

### Testing

Before submitting a pull request:

1. Test the backend:
   ```bash
   cd backend
   python -c "import main; import workflow; import ssh_executor"
   ```

2. Test the frontend build:
   ```bash
   cd frontend
   npm run build
   ```

3. Run security checks:
   ```bash
   # Check for dependency vulnerabilities
   pip-audit  # For Python
   npm audit  # For Node.js
   ```

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Keep the first line under 72 characters
- Add details in the body if needed

Example:
```
Add validation for ISO file paths

- Check if ISO files exist before mounting
- Show clear error message if file not found
- Add retry logic for transient failures
```

## Pull Request Process

1. Update documentation if you change functionality
2. Add screenshots for UI changes
3. Ensure all tests pass
4. Update the README.md if needed
5. Request review from maintainers

## Security

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. Email the maintainer directly (see README for contact)
3. Provide detailed information about the vulnerability
4. Wait for a response before disclosing publicly

## Adding New Features

When adding new features:

1. Create an issue first to discuss the feature
2. Wait for approval from maintainers
3. Follow the existing code structure
4. Add appropriate error handling
5. Update documentation
6. Add security checks if handling sensitive data

## Bug Reports

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (for UI issues)
- Environment details (OS, Python/Node version, etc.)

## Questions?

Feel free to open an issue with the "question" label if you need help or clarification.

Thank you for contributing! 🚀

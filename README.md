# Any-Windows-Contabo-VPS - Installation Guide

Easy installation of any version of Windows for your Contabo VPS.

## Introduction

This repository provides **two methods** for installing Windows on a Contabo VPS:

1. **🚀 NEW: Web-Based Installer** (Recommended) - Modern, visual UI with step-by-step progress
2. **💻 Classic: SSH Script Method** - Traditional command-line approach

Please be aware that you assume full responsibility for all risks associated with this installation. **This process will ERASE ALL DATA on your VPS.**

---

## Method 1: Web-Based Installer (Recommended)

### Overview

The web-based installer provides a modern, visual interface for installing Windows on your Contabo VPS. No manual SSH commands required!

**Features:**
- ✅ Visual step-by-step progress tracking
- ✅ Interactive prompts for all decisions
- ✅ Automatic remote execution via SSH
- ✅ Modern UI with icons and progress indicators
- ✅ No script upload to VPS - all commands executed remotely
- ✅ Works on Linux, macOS, and Windows

### Prerequisites

**For the VPS:**
- A Contabo VPS
- Rescue System (Debian 10 - Live) activated
- VNC Viewer for post-installation. Download from [here](https://www.realvnc.com/en/connect/download/viewer/)
- Microsoft Remote Desktop for RDP connection after installation

**For running the installer:**
- Docker and Docker Compose (recommended), OR
- Python 3.11+ and Node.js 18+ (for manual setup)

### Quick Start with Docker

1. **Clone this repository:**
   ```bash
   git clone https://github.com/JaRufoMarquez/Any-Windows-Contabo-VPS.git
   cd Any-Windows-Contabo-VPS
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Open your browser:**
   Navigate to `http://localhost` (or `http://your-server-ip` if running on a remote server)

4. **Follow the on-screen instructions:**
   - Enter your VPS IP address
   - Enter the Rescue System password
   - Click "Connect & Start Installation"
   - Follow the interactive prompts in the UI

### Manual Setup (Without Docker)

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Frontend Setup (in a new terminal):**
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Step-by-Step Web Installer Guide

#### Step 1: Prepare Your VPS

1. Log in to the **Contabo control panel**
2. Navigate to **"Your services"** → Select your VPS
3. Click **"Manage"** → **"Rescue System"**
4. Choose **"Debian 10 - Live"** from the dropdown
5. Set a secure password (you'll need this for the installer)
6. Click **"Start Rescue System"** and wait for it to boot (2-3 minutes)

#### Step 2: Set VNC Password (for later use)

1. In the control panel, go to **"VPS control"**
2. Click **"Manage"** → **"VNC password"**
3. Set a VNC password (8 characters, at least one uppercase, one lowercase, one number, no special characters)

#### Step 3: Launch the Web Installer

1. Open the web installer at `http://localhost` or your server address
2. Enter your VPS details:
   - **VPS IP Address:** Your Contabo VPS IP
   - **Username:** `root` (default)
   - **Password:** Your Rescue System password
   - **SSH Port:** `22` (default)
3. Click **"Connect & Start Installation"**

![Web Installer Connection Form](https://github.com/user-attachments/assets/96805f23-eeb0-4fcb-ac7b-60b558884ffd)

*The modern web interface makes it easy to connect to your VPS*

#### Step 4: Follow Interactive Prompts

The installer will guide you through each step with clear prompts:

**Disk Operations Confirmation:**
- You'll be warned about data erasure
- Confirm to proceed with partitioning

**Windows ISO:**
- Choose to download from URL (with default provided) or upload manually
- If uploading, use SCP/SFTP to upload to `/root/windisk/Windows.iso`

**Virtio Drivers ISO:**
- Choose to download from URL (with default provided) or upload manually
- If uploading, use SCP/SFTP to upload to `/root/windisk/Virtio.iso`

**WIM Image Selection:**
- View available Windows images in boot.wim
- Select the Windows edition you want to install

**Reboot Confirmation:**
- Confirm to reboot the VPS into Windows installer
- The SSH connection will be lost (this is expected)

#### Step 5: Monitor Progress

- Watch real-time progress through 18 installation steps
- Each step shows status: Pending, Running, Completed, or Failed
- Any errors are displayed immediately
- The process typically takes 15-30 minutes

### What the Installer Does

The web installer performs the following operations remotely via SSH:

1. **System Update** - Updates and upgrades system packages
2. **Install Kernel** - Installs linux-image-amd64
3. **Install Tools** - Installs GRUB, wimtools, ntfs-3g, gdisk
4. **Disk Partitioning** - Creates GPT partition table with two NTFS partitions
5. **Format Partitions** - Formats partitions as NTFS
6. **Mount Partitions** - Mounts /dev/sda1 to /mnt and /dev/sda2 to /root/windisk
7. **Install GRUB** - Installs and configures GRUB bootloader
8. **Handle ISOs** - Downloads or receives Windows and Virtio ISOs
9. **Copy Files** - Extracts ISO contents to the boot partition
10. **Update WIM** - Injects Virtio drivers into boot.wim
11. **Reboot** - Reboots into Windows installer

### Security Notes

- **Passwords are NOT stored** - they're kept in memory only for the job lifetime
- **Use HTTPS** in production (configure reverse proxy like nginx)
- **Firewall** the application - only expose to trusted networks
- **Connection validation** - the app validates SSH connectivity before starting
- **No script upload** - all commands executed remotely, no files uploaded to VPS
- **Read-only to .sh file** - the original script is never executed on the VPS
- **Host key validation** - Uses SSH AutoAddPolicy for rescue system scenarios where host keys may change; in production deployments, consider implementing stricter host key validation

---

## Method 2: Classic SSH Script Installation

If you prefer the traditional command-line approach, you can still use the manual SSH method.

### Prerequisites

- VNC Viewer application installed. Download it from [here](https://www.realvnc.com/en/connect/download/viewer/).
- A Contabo VPS
- Microsoft Remote Desktop for RDP connection to the machine.
- Putty application installed on Windows. Download it from [here](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html).
- Optionally, you can install the following programs (if you have downloaded the .iso images):
  WinSCP Download it from [here](https://winscp.net/eng/download.php).

### Steps for installation

### Steps for Classic SSH Installation

#### 1. Prepare the VPS for installation

- Purchase a new Ubuntu VPS
- Log in to the Contabo user panel and navigate to the "Your services" section.
- On your VPS click the "Manage" button and select "Rescue System".
- Choose "Debian 10 - Live" from the "Rescue System Version" dropdown menu.
- Set a password and start the Rescue System.
- From the control panel go to "VPS control".
- Click the "Manage" button and select "VNC password".
- Set the VNC password. It must be 8 characters long, containing at least one uppercase and one lowercase character, and one number. Avoid using any special characters.
  
#### 2. Connect to the VPS via SSH

- Open Terminal on MacOS or PuTTY on Windows.
- Log in with the command `ssh root@<MACHINE-IP>` and enter your Rescue System password.
- Execute the following commands:
  - `apt install git -y`
  - `git clone https://github.com/JaRufoMarquez/Any-Windows-Contabo-VPS.git`
  - `cd Any-Windows-Contabo-VPS`
  - `chmod +x windows-install.sh`
  - `./windows-install.sh`
  - The process takes approximately 15 minutes and completes when the ssh session disconnects due to the machine rebooting.

---

## Post-Installation Steps (Both Methods)

After the installation completes (either via web installer or SSH script), continue with VNC to complete Windows setup.

### 3. Connect to the VPS with VNC to install Windows

- Open your VNC app and create a new connection using the IP and PORT found on the VPS control page. Hover over "Manage" and click on "VNC Information"
- Upon connecting, you will see a screen as shown in the image. Press Enter.

  ![text](https://i.ibb.co/j8Ckb0x/windows-installer.png)

- Follow the on-screen prompts to install Windows.
- Install the virtIO drivers as shown in the following images.
- Click on "Browse"
  
  ![text](https://i.ibb.co/x2S5brz/browser.png)

- From Boot select `virtio_drivers`
  
  ![text](https://i.ibb.co/MghHSxm/virtio.png)

- Select `amd64\w10` and click on "Ok"
  
  ![text](https://i.ibb.co/jTmb57J/w10.png)

- Click on "Next"
  
  ![text](https://i.ibb.co/LS3sq47/next.png)

- Click on "Custom: Install Windows Only (advanced)"

  ![text](https://i.ibb.co/X7swb6C/custom-install.png)

- For the installation, select the partition `Drive 0 Partition 1`
  
  ![text](https://i.ibb.co/mSq9KjR/select-partition.png)

- Choose the operating system and then click on "Next"
  
  ![text](https://i.ibb.co/2FF8W7b/os-select.png)

### 4. Install the Ethernet adapter for internet connection

- Open the `Device Manager`

  ![text](https://i.ibb.co/PxGQ9Rz/device-manager.png)

- Right-click on `Ethernet Controller` and select `Update Driver`
  
  ![text](https://i.ibb.co/Ycjf3b4/update-driver.png)

- Choose `Browse my computer for drivers`
  
  ![text](https://i.ibb.co/X7vht8v/browse-computer-drivers.png)

- Click on `Browse` and select the path `C:\sources\virtio`, and click "Next"
  
  ![text](https://i.ibb.co/7WJXyxW/driver-path.png)

- Click on `Install`
  
  ![text](https://i.ibb.co/0nqRzJG/install-driver.png)

### 5. Allow Remote Access Connection for RDP

- Search for `allow remote connections to this computer` and select the first option.

  ![text](https://i.ibb.co/Xb4hwQp/allow-remote.png)

- In the Remote Desktop section, click on `Show settings`
  
  ![text](https://i.ibb.co/kD4tN2P/show-settings.png)

- Choose `Allow remote connections to this computer`, click "Apply" and then "Ok"
  
  ![text](https://i.ibb.co/Rv0R5L1/allow-remote-connections.png)

- Now, connect remotely using your Remote Desktop Connection program with the credentials created during the Windows installation.

## Conclusions

Congratulations! You should now have a fully operational Windows installation on your Contabo VPS. Remember to proceed with these instructions at your own risk and ensure that all software and applications used are legal and compliant with the respective licenses.

---

## Troubleshooting

### Web Installer Issues

**Cannot connect to VPS:**
- Verify the Rescue System is active and running
- Check the IP address and password are correct
- Ensure SSH port 22 is accessible
- Verify your firewall allows SSH connections

**Installation fails at a specific step:**
- Check the error message displayed in the UI
- Verify disk space is sufficient
- Check ISO files are valid and complete
- Review backend logs: `docker-compose logs backend`

**ISO download is slow or fails:**
- Use the manual upload option instead
- Upload ISOs via SCP: `scp Windows.iso root@<VPS-IP>:/root/windisk/`
- Ensure stable internet connection on the VPS

### SSH Script Issues

**Script hangs or times out:**
- Check internet connectivity on the VPS
- Verify ISO download URLs are accessible
- Ensure sufficient disk space

### General Issues

**VNC doesn't show Windows installer:**
- Wait a few minutes after reboot
- Verify the reboot completed successfully
- Check GRUB was configured correctly
- Try force rebooting from Contabo control panel

**Windows installation can't find disk:**
- Make sure you loaded Virtio drivers from `C:\sources\virtio`
- Browse to `virtio_drivers\amd64\w10` (or appropriate Windows version)
- If still not visible, restart the Windows installer

---

## Architecture

### Web Installer Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser   │ ◄─────► │   Frontend   │ ◄─────► │   Backend    │
│   (React)   │  HTTP   │  (Nginx)     │   API   │  (FastAPI)   │
└─────────────┘         └──────────────┘         └──────┬───────┘
                                                         │
                                                         │ SSH
                                                         │
                                                  ┌──────▼───────┐
                                                  │ Contabo VPS  │
                                                  │ (Rescue Mode)│
                                                  └──────────────┘
```

**Components:**
- **Frontend:** React + Vite + Tailwind CSS for modern UI
- **Backend:** Python FastAPI for REST API and SSH execution
- **SSH Executor:** Paramiko library for remote command execution
- **Workflow Engine:** Step-based execution with state management

### How It Works

1. User enters VPS credentials in the web UI
2. Backend validates SSH connection
3. Workflow engine converts `windows-install.sh` logic into discrete steps
4. Each step is executed remotely via SSH (no script upload)
5. Frontend polls backend for progress updates
6. Interactive prompts pause workflow and wait for user input
7. Status updates shown in real-time with visual indicators

---

## Development

### Running Locally

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Building for Production

```bash
docker-compose build
docker-compose up -d
```

### Project Structure

```
Any-Windows-Contabo-VPS/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── workflow.py          # Workflow engine and steps
│   ├── ssh_executor.py      # SSH command execution
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend Docker image
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConnectionForm.jsx
│   │   │   ├── WorkflowProgress.jsx
│   │   │   └── PromptDialog.jsx
│   │   ├── App.jsx          # Main application
│   │   └── main.jsx         # Entry point
│   ├── package.json         # Node dependencies
│   └── Dockerfile           # Frontend Docker image
├── docker-compose.yml       # Docker Compose configuration
├── windows-install.sh       # Original SSH script (still available)
└── README.md               # This file
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

This project is provided as-is under the license specified in the LICENSE file.

---

## Disclaimer

**⚠️ IMPORTANT WARNINGS:**

- This process will **ERASE ALL DATA** on your VPS `/dev/sda` disk
- You assume **FULL RESPONSIBILITY** for any data loss or issues
- Ensure you have proper Windows licenses for the version you install
- This is an **unofficial installation method** - not supported by Contabo
- The authors are **NOT LIABLE** for any damages or data loss
- Use at your **OWN RISK**

**Security Considerations:**
- Do not expose the web installer to the public internet without proper authentication
- Use HTTPS in production environments
- Change default passwords immediately after Windows installation
- Keep your VPS and applications updated with security patches

---

## Support

For issues, questions, or contributions, please use the GitHub Issues page:
https://github.com/JaRufoMarquez/Any-Windows-Contabo-VPS/issues

---

**Happy Installing! 🚀**

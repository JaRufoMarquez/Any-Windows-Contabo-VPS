# Any-Windows-Contabo-VPS - Installation Guide

[🇬🇧 English](#english) | [🇪🇸 Español](#español)

---

<a name="english"></a>
## 🇬🇧 English

Easy installation of any version of Windows for your Contabo VPS - Now with a **Modern Web Interface**!

### Introduction

This repository provides TWO ways to install Windows on a Contabo VPS:
1. **🌐 Web-based Installer** (NEW) - Modern, bilingual UI with step-by-step guidance
2. **⌨️ Manual Script** (Original) - Command-line installation using `windows-install.sh`

Please be aware that you assume full responsibility for all risks associated with this installation.

---

## 🌐 Web-based Installer (Recommended)

### Features

✨ **Modern Bilingual Interface** - Switch between English and Spanish  
🎯 **Step-by-Step Progress** - Visual feedback for each installation phase  
🔐 **Secure** - Passwords stored in memory only, never persisted  
🐳 **Docker Support** - Easy deployment with Docker Compose  
💡 **Interactive Prompts** - Clear confirmations for all critical operations  
📊 **Real-time Status** - Live updates during installation

### Quick Start with Docker (Easiest)

1. **Clone the repository**
   ```bash
   git clone https://github.com/JaRufoMarquez/Any-Windows-Contabo-VPS.git
   cd Any-Windows-Contabo-VPS
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Open your browser**
   Navigate to `http://localhost` (or your server IP)

4. **Follow the web interface**
   - Enter your VPS IP address
   - Enter your Rescue System password
   - Click "Start Installation"
   - Follow the interactive prompts

### Manual Installation (Without Docker)

#### Backend Setup

1. **Install Python 3.11+**

2. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Run the backend**
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`

#### Frontend Setup

1. **Install Node.js 18+**

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   The UI will be available at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```

### How the Web Installer Works

The web installer automates the entire workflow by:

1. **Connecting via SSH** to your VPS in Rescue mode
2. **Executing commands remotely** - No script uploads needed
3. **Presenting interactive prompts** for critical decisions:
   - Disk partitioning confirmation
   - Windows.iso download or manual upload
   - Virtio.iso download or manual upload
   - Boot image selection
   - Reboot confirmation
4. **Showing real-time progress** for each step
5. **Handling disconnections gracefully** during reboot

### Security Considerations

🔒 **Important Security Notes:**

- Passwords are **never stored on disk** - kept in memory only for the duration of the job
- The application connects directly to your VPS via SSH
- All communication with the backend happens over your network
- For production use, consider:
  - Running behind HTTPS/TLS reverse proxy
  - Implementing authentication
  - Restricting network access
  - Using environment variables for sensitive configuration

### Mapping to Manual Installation

The web installer performs the exact same operations as the manual script:

| Web Installer Step | Original Script Equivalent |
|---------------------|---------------------------|
| Update system | `apt update && apt upgrade` |
| Install packages | `apt install grub2 wimtools ntfs-3g` |
| Partition disk | `parted` commands |
| Format partitions | `mkfs.ntfs` commands |
| Install GRUB | `grub-install` |
| Download/Upload ISOs | `wget` or manual upload |
| Mount and copy files | `mount`, `rsync` |
| Update boot.wim | `wimlib-imagex update` |
| Reboot | `reboot` |

### Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/d2035d87-deb4-49c7-97f9-d6e2512bb830" alt="Web Installer Home - English" width="45%">
  <img src="https://github.com/user-attachments/assets/47216c9f-c8e9-44fb-9ac4-a17ce0d14e4e" alt="Web Installer Home - Spanish" width="45%">
</div>

*Modern bilingual interface (English & Spanish) with real-time progress tracking*

---

## ⌨️ Manual Script Installation (Original Method)

### Requisitos Previos

- Aplicación VNC Viewer instalada. Descárgala desde [aquí](https://www.realvnc.com/en/connect/download/viewer/).
- Un VPS de Contabo
- Microsoft Remote Desktop para conexión RDP a la máquina.
- Aplicación Putty instalada en Windows. Descárgala desde [aquí](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html).
- Opcionalmente, puedes instalar los siguientes programas (si has descargado las imágenes .iso):
  WinSCP Descárgalo desde [aquí](https://winscp.net/eng/download.php).

### Pasos para la instalación

### 1. Preparar el VPS para la instalación

- Purchase a new Ubuntu VPS
- Log in to the Contabo user panel and navigate to the "Your services" section.
- On your VPS click the "Manage" button and select "Rescue System".
- Choose "Debian 10 - Live" from the "Rescue System Version" dropdown menu.
- Set a password and start the Rescue System.
- From the control panel go to "VPS control".
- Click the "Manage" button and select "VNC password".
- Set the VNC password. It must be 8 characters long, containing at least one uppercase and one lowercase character, and one number. Avoid using any special characters.
  
### 2. Connect to the VPS via SSH

- Open Terminal on MacOS or PuTTY on Windows.
- Log in with the command `ssh root@<MACHINE-IP>` and enter your Rescue System password.
- Execute the following commands:
  - `apt install git -y`
  - `git clone https://github.com/JaRufoMarquez/Any-Windows-Contabo-VPS.git`
  - `cd Any-Windows-Contabo-VPS`
  - `chmod +x windows-install.sh`
  - `./windows-install.sh`
  - The process takes approximately 15 minutes and completes when the ssh session disconnects due to the machine rebooting.

### 3. Connnect to the VPS with VNC to install Windows

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

Congratulations! You should now have a fully operational Windows 10 installation on your Contabo VPS. Remember to proceed with these instructions at your own risk and ensure that all software and applications used are legal and compliant with the respective licenses.
Congratulations! You should now have a fully operational Windows 10 installation on your Contabo VPS. Remember to proceed with these instructions at your own risk and ensure that all software and applications used are legal and compliant with the respective licenses.

---

<a name="español"></a>
## 🇪🇸 Español

Instalación fácil de cualquier versión de Windows para tu VPS de Contabo - ¡Ahora con **Interfaz Web Moderna**!

### Introducción

Este repositorio proporciona DOS formas de instalar Windows en un VPS de Contabo:
1. **🌐 Instalador Web** (NUEVO) - Interfaz moderna y bilingüe con guía paso a paso
2. **⌨️ Script Manual** (Original) - Instalación por línea de comandos usando `windows-install.sh`

Ten en cuenta que asumes toda la responsabilidad de los riesgos asociados con esta instalación.

---

## 🌐 Instalador Web (Recomendado)

### Características

✨ **Interfaz Bilingüe Moderna** - Cambia entre Inglés y Español  
🎯 **Progreso Paso a Paso** - Retroalimentación visual para cada fase  
🔐 **Seguro** - Contraseñas solo en memoria, nunca persistidas  
🐳 **Soporte Docker** - Despliegue fácil con Docker Compose  
💡 **Avisos Interactivos** - Confirmaciones claras para operaciones críticas  
📊 **Estado en Tiempo Real** - Actualizaciones en vivo durante la instalación

### Inicio Rápido con Docker (Más Fácil)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/JaRufoMarquez/Any-Windows-Contabo-VPS.git
   cd Any-Windows-Contabo-VPS
   ```

2. **Iniciar la aplicación**
   ```bash
   docker-compose up -d
   ```

3. **Abrir el navegador**
   Navega a `http://localhost` (o la IP de tu servidor)

4. **Seguir la interfaz web**
   - Ingresa la dirección IP de tu VPS
   - Ingresa tu contraseña del Sistema de Rescate
   - Haz clic en "Iniciar Instalación"
   - Sigue los avisos interactivos

### Instalación Manual (Sin Docker)

#### Configuración del Backend

1. **Instalar Python 3.11+**

2. **Instalar dependencias**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Ejecutar el backend**
   ```bash
   python main.py
   ```
   La API estará disponible en `http://localhost:8000`

#### Configuración del Frontend

1. **Instalar Node.js 18+**

2. **Instalar dependencias**
   ```bash
   cd frontend
   npm install
   ```

3. **Ejecutar servidor de desarrollo**
   ```bash
   npm run dev
   ```
   La interfaz estará disponible en `http://localhost:3000`

4. **Compilar para producción**
   ```bash
   npm run build
   ```

### Cómo Funciona el Instalador Web

El instalador web automatiza todo el flujo de trabajo:

1. **Conectando vía SSH** a tu VPS en modo Rescate
2. **Ejecutando comandos remotamente** - No se necesita subir scripts
3. **Presentando avisos interactivos** para decisiones críticas:
   - Confirmación de particionado del disco
   - Descarga de Windows.iso o carga manual
   - Descarga de Virtio.iso o carga manual
   - Selección de imagen de arranque
   - Confirmación de reinicio
4. **Mostrando progreso en tiempo real** para cada paso
5. **Manejando desconexiones elegantemente** durante el reinicio

### Consideraciones de Seguridad

🔒 **Notas de Seguridad Importantes:**

- Las contraseñas **nunca se almacenan en disco** - se mantienen solo en memoria durante la duración del trabajo
- La aplicación se conecta directamente a tu VPS vía SSH
- Toda comunicación con el backend ocurre sobre tu red
- Para uso en producción, considera:
  - Ejecutar detrás de un proxy inverso HTTPS/TLS
  - Implementar autenticación
  - Restringir el acceso a la red
  - Usar variables de entorno para configuración sensible

### Equivalencia con Instalación Manual

El instalador web realiza exactamente las mismas operaciones que el script manual:

| Paso del Instalador Web | Equivalente en Script Original |
|--------------------------|-------------------------------|
| Actualizar sistema | `apt update && apt upgrade` |
| Instalar paquetes | `apt install grub2 wimtools ntfs-3g` |
| Particionar disco | comandos `parted` |
| Formatear particiones | comandos `mkfs.ntfs` |
| Instalar GRUB | `grub-install` |
| Descargar/Subir ISOs | `wget` o carga manual |
| Montar y copiar archivos | `mount`, `rsync` |
| Actualizar boot.wim | `wimlib-imagex update` |
| Reiniciar | `reboot` |

### Capturas de Pantalla

<div align="center">
  <img src="https://github.com/user-attachments/assets/d2035d87-deb4-49c7-97f9-d6e2512bb830" alt="Inicio del Instalador Web - Inglés" width="45%">
  <img src="https://github.com/user-attachments/assets/47216c9f-c8e9-44fb-9ac4-a17ce0d14e4e" alt="Inicio del Instalador Web - Español" width="45%">
</div>

*Interfaz moderna bilingüe (Inglés y Español) con seguimiento de progreso en tiempo real*

---

## ⌨️ Instalación con Script Manual (Método Original)

### Requisitos Previos

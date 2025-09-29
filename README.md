# Transkript

A minimal Electron desktop application for creating time-coded transcripts and exporting them as subtitle-style text files.

## 🎯 Features

- **Time-coded Transcription**: Enter precise timestamps in HH:MM:SS:FR format (hours:minutes:seconds:frames)
- **Input Validation**: Validation with automatic formatting and bounds checking
- **Duplicate Prevention**: Automatically prevents duplicate entries with identical timestamps and text
- **Overlap Detection**: Ensures no time ranges overlap between entries
- **Auto-sorting**: Results are automatically sorted by start time
- **Edit & Delete**: Click any result to edit or delete entries
- **TXT Export**: Export all entries to a subtitle-format text file
- **Cross-platform**: Built with Electron for Windows, macOS, and Linux

## 🛠️ Tech Stack

- **Electron** + **Electron Forge** - Desktop app framework and build tooling
- **Vite** - Fast build tool and dev server
- **TypeScript**
- **Vanilla HTML/CSS** - Lightweight UI without frameworks

## 🚀 Getting Started

### Setup

Head over to the Releases tab, and download the latest version for your operating system.

(Optional) Extract the contents to a folder of your choice

Run transkript.exe.

# 📖 Usage

## Basic Workflow
- **Enter Timestamps**: Fill in start and end times using `HH:MM:SS:FR` format  
  - Hours: `00-99`  
  - Minutes: `00-59`  
  - Seconds: `00-59`  
  - Frames: `00-23` (24fps standard)  
- **Add Text**: Type your transcript text in the text area  
- **Save Entry**: Click **"Add to Results"** to save the timestamped entry  
- **Edit Entries**: Click any result item to open the edit modal  
- **Export**: Click **"Export to TXT"** to download all entries as a subtitle file  

---

## ✅ Validation Rules
- Start time must be **before** end time  
- No duplicate entries (same timestamps + text)  
- No overlapping time ranges  
- Automatic sorting by start time  

---

## 📤 Export Format
```
<begin subtitles>

HH:MM:SS:FR HH:MM:SS:FR
Subtitle Here

<end subtitles>
```
## Screenshots
### Home screen
![Home screen of application](https://res.cloudinary.com/daxepxlws/image/upload/v1756601811/homescreen_rzcvsy.png)
### Add Text
![Text added](https://res.cloudinary.com/daxepxlws/image/upload/v1756601811/addedtext_onmfaf.png)
### Edit time and transcript text
![Edit time and text](https://res.cloudinary.com/daxepxlws/image/upload/v1756601811/edittext_cldl8u.png)
### Output Result
![Output result](https://res.cloudinary.com/daxepxlws/image/upload/v1756601811/testexport_k5nggv.png)

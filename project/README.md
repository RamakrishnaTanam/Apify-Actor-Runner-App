# Apify Actor Runner App

A full-stack web application that demonstrates integration with the [Apify platform](https://apify.com), allowing users to authenticate with their API key, select available actors, dynamically render their schemas, execute actor runs, and view results in real time.

---

## 🚀 Features

### ✅ Frontend
- **API Key Authentication** – Securely authenticate with your personal Apify API key
- **Browse Actors** – List and select your available actors dynamically
- **Dynamic Form Generation** – Automatically generate input forms based on actor schema
- **Actor Execution** – Run actors in real time and poll for completion
- **Results Viewer** – Display execution results and datasets
- **Error Handling** – Graceful error messages for network or API failures

### 🛠️ Backend
- **API Proxy** – Securely proxies all requests to the Apify platform
- **Rate Limiting & CORS** – Protects backend and allows frontend interaction
- **Environment-Based Setup** – Easily configurable for different environments

---

## 🧪 Actor Used for Testing

**Chosen Actor:** [`apify/website-content-crawler`](https://apify.com/apify/website-content-crawler)

This actor is used to crawl and extract structured content from websites.

---

## 📌 Assumptions & Design Choices

- **Actor Schema Assumption:** Assumes each actor has a valid `inputSchema` returned by the Apify API.
- **Authentication Simplicity:** Uses direct API Key authentication (no OAuth) for simplicity and security in testing.
- **Dynamic Form Rendering:** The form is dynamically generated based on the actor's input schema (supports strings, booleans, enums).
- **Polling Strategy:** Uses a polling approach to wait for the actor run to finish and fetch results immediately.
- **Minimal Dependencies:** Keeps the tech stack minimal using only essential packages (React, TailwindCSS, Node.js, Express).
- **Error Tolerance:** UI is designed to catch and display common API and network errors clearly to the user.
- **No Local Storage:** The API key is stored in memory (not persisted across sessions) for security.

---

## 📸 Screenshots

### 🔐 API Key Login
![API Key Login](./screenshots/Screenshot%20(101).png)

### 🎭 Actor List & Selection
![No Actors Loaded](./screenshots/Screenshot%20(102).png)

### 🟢 Actor Run & Output
![Website Content Crawler Actor](./screenshots/Screenshot%20(103).png)

---

## 🛠️ Installation & Running the Application

### 📦 Prerequisites

- Node.js (v16+)
- npm or yarn
- Apify API Key (from [apify.com](https://my.apify.com/account#/integrations))

---

### 🧑‍💻 Clone the Repository

```bash
git clone https://github.com/RamakrishnaTanam/Apify-Actor-Runner-App.git
cd Apify-Actor-Runner-App

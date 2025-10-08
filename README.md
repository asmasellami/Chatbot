# 💬 Chatbot Interne – Gestion Documentaire & Réponses Automatisées

## 🧠 Description
Développement d’un chatbot interne pour la **gestion documentaire** et l’**automatisation des réponses aux questions des employés**, utilisant **Flask**, **Angular** et **Spring Boot**.

Le projet inclut :  
- NLP pour améliorer la pertinence des réponses  
- Dashboard Admin pour gérer intents, utilisateurs et fichiers  
- Architecture modulaire : Frontend (Angular), Backend (Spring Boot), NLP (Flask)

---

## 🛠️ Technologies utilisées
- **Frontend** : Angular  
- **Backend** : Java / Spring Boot  
- **NLP** : Python / Flask  
- **Base de données** : MySQL / MongoDB  
- **API REST**  

---

## 📂 Structure du projet
Chatbot/
├── chatbotFront/ # Application Angular (frontend)
├── chatbot # Backend Spring Boot
└── chatbotNLP/ # Service Flask pour NLP


---

## ⚙️ Installation et exécution

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/asmasellami/Chatbot.git
cd Chatbot
### 2️⃣ Frontend (Angular)
```bash
cd chatbotFront
npm install
ng serve
Accéder à : http://localhost:4200
###3️⃣ Backend (Spring Boot)
```bash
cd ../chatbotBack
mvn spring-boot:run
###4️⃣ Service NLP (Flask)
```bash
cd ../chatbotNLP
pip install -r requirements.txt
python app.py


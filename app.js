/* ========================================
   AlexGPT - Chat Platform Application
   ======================================== */

// ========================================
// State Management
// ========================================

const state = {
    conversations: JSON.parse(localStorage.getItem('alexgpt-conversations') || '[]'),
    currentConversationId: null,
    settings: JSON.parse(localStorage.getItem('alexgpt-settings') || '{}'),
    isGenerating: false
};

// Default settings
const defaultSettings = {
    theme: 'dark',
    fontSize: 16
};

state.settings = { ...defaultSettings, ...state.settings };

// ========================================
// DOM Elements
// ========================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const elements = {
    sidebar: $('#sidebar'),
    sidebarToggle: $('#sidebarToggle'),
    newChatBtn: $('#newChatBtn'),
    conversationList: $('#conversationList'),
    welcomeScreen: $('#welcomeScreen'),
    messagesContainer: $('#messagesContainer'),
    messagesWrapper: $('#messagesWrapper'),
    messageInput: $('#messageInput'),
    sendBtn: $('#sendBtn'),
    settingsBtn: $('#settingsBtn'),
    settingsModal: $('#settingsModal'),
    closeSettings: $('#closeSettings'),
    fontSizeSelect: $('#fontSizeSelect'),
    clearAllBtn: $('#clearAllBtn')
};

// ========================================
// AI Response Engine
// ========================================

const AI = {
    responses: {
        greetings: [
            "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
            "Salut ! Je suis AlexGPT, votre assistant intelligent. Que puis-je faire pour vous ?",
            "Hello ! Ravi de vous retrouver. Quelle est votre question ?"
        ],
        intelligence_artificielle: [
            `L'intelligence artificielle (IA) est un domaine de l'informatique qui vise à créer des systèmes capables de réaliser des tâches nécessitant normalement l'intelligence humaine.

**Les principaux types d'IA :**

1. **IA étroite (ANI)** - Spécialisée dans une tâche spécifique (ex: reconnaissance vocale, jeux d'échecs)
2. **IA générale (AGI)** - Capacité de comprendre et apprendre n'importe quelle tâche intellectuelle humaine
3. **Super IA (ASI)** - Hypothétique IA dépassant l'intelligence humaine

**Comment fonctionne l'IA :**

- **Apprentissage automatique (Machine Learning)** : L'IA apprend à partir de données sans être explicitement programmée
- **Réseaux de neurones** : Inspirés du cerveau humain, ils traitent l'information en couches
- **Deep Learning** : Utilise des réseaux de neurones profonds pour des tâches complexes
- **Traitement du langage naturel (NLP)** : Permet à l'IA de comprendre et générer du texte humain

L'IA est utilisée dans de nombreux domaines : santé, finance, transport, éducation, et bien sûr, dans les assistants comme moi ! 🤖`
        ],
        poeme: [
            `Voici un poème sur la technologie moderne :

---

**L'Ère Numérique**

*Dans le silence des serveurs qui ronronnent,*
*Des milliards de données tourbillonnent,*
*Comme des étoiles dans un ciel binaire,*
*Éclairant notre monde ordinaire.*

*Nos doigts effleurent des écrans de verre,*
*Connectés au monde, à l'univers entier,*
*Chaque clic ouvre une nouvelle frontière,*
*Chaque code écrit, un rêve à créer.*

*L'intelligence naît dans les algorithmes,*
*Les machines apprennent nos paradigmes,*
*Et dans cette danse de zéros et de uns,*
*L'humanité réinvente son destin commun.*

---

La technologie est une source d'inspiration infinie ! Voulez-vous un autre poème ou sur un thème différent ?`
        ],
        developpement_web: [
            `Excellent choix ! Voici un plan pour votre projet de développement web :

**Phase 1 : Planification (1-2 semaines)**
- Définir les objectifs et le public cible
- Créer des wireframes et maquettes
- Choisir la stack technologique

**Phase 2 : Design (1-2 semaines)**
- Concevoir l'interface utilisateur (UI)
- Définir l'expérience utilisateur (UX)
- Créer un design system cohérent

**Phase 3 : Développement Frontend (2-4 semaines)**
- Structure HTML sémantique
- Styles CSS / Framework (Tailwind, Bootstrap)
- Logique JavaScript / Framework (React, Vue, Angular)

**Phase 4 : Développement Backend (2-4 semaines)**
- API REST ou GraphQL
- Base de données (PostgreSQL, MongoDB)
- Authentification et sécurité

**Phase 5 : Tests & Déploiement (1-2 semaines)**
- Tests unitaires et d'intégration
- Optimisation des performances
- Déploiement (Vercel, AWS, etc.)

**Outils recommandés :**
- Git pour le versioning
- VS Code comme éditeur
- Figma pour le design
- Docker pour la conteneurisation

Voulez-vous approfondir l'une de ces phases ?`
        ],
        cybersecurite: [
            `Voici les meilleures pratiques en cybersécurité :

**🔐 Protection des comptes**
- Utiliser des mots de passe forts et uniques (min. 12 caractères)
- Activer l'authentification à deux facteurs (2FA)
- Utiliser un gestionnaire de mots de passe

**🛡️ Sécurité réseau**
- Utiliser un VPN sur les réseaux publics
- Maintenir votre pare-feu activé
- Mettre à jour régulièrement votre routeur

**💻 Sécurité des appareils**
- Installer les mises à jour de sécurité immédiatement
- Utiliser un antivirus fiable
- Chiffrer vos disques durs

**📧 Protection contre le phishing**
- Vérifier l'expéditeur des emails
- Ne jamais cliquer sur des liens suspects
- Signaler les tentatives de phishing

**🔒 Bonnes pratiques développeur**
- Valider toutes les entrées utilisateur
- Utiliser HTTPS partout
- Appliquer le principe du moindre privilège
- Effectuer des audits de sécurité réguliers

**📱 Sécurité mobile**
- Télécharger uniquement depuis les stores officiels
- Vérifier les permissions des applications
- Activer le verrouillage biométrique

La cybersécurité est l'affaire de tous ! Voulez-vous approfondir un aspect en particulier ?`
        ],
        default: [
            "C'est une excellente question ! Laissez-moi y réfléchir...\n\nJe suis AlexGPT, un assistant de démonstration. Dans cette version, mes réponses sont pré-programmées, mais je fais de mon mieux pour vous aider !\n\nN'hésitez pas à me poser des questions sur :\n- L'intelligence artificielle\n- La programmation et le développement web\n- La cybersécurité\n- Ou demandez-moi d'écrire un poème !",
            "Merci pour votre message ! Je suis AlexGPT, votre assistant personnel.\n\nBien que je sois une version de démonstration, je peux discuter de plusieurs sujets. Essayez de me demander :\n- Comment fonctionne l'IA\n- D'écrire quelque chose de créatif\n- Des conseils en développement web\n- Des astuces en cybersécurité",
            "Intéressant ! Je note votre question.\n\nEn tant qu'assistant de démonstration, j'ai des connaissances sur certains sujets clés. Voici ce que je peux faire :\n\n1. **Expliquer** des concepts technologiques\n2. **Écrire** des textes créatifs\n3. **Conseiller** sur des projets de développement\n4. **Informer** sur la cybersécurité\n\nQue souhaitez-vous explorer ?"
        ]
    },

    getResponse(message) {
        const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (/^(bonjour|salut|hello|hey|coucou|hi|bonsoir)/i.test(lower)) {
            return this.pickRandom(this.responses.greetings);
        }
        if (/intelligence artificielle|comment.*fonctionne.*ia|machine learning|deep learning/i.test(lower)) {
            return this.pickRandom(this.responses.intelligence_artificielle);
        }
        if (/poeme|poesie|ecris.*poeme|texte.*creatif/i.test(lower)) {
            return this.pickRandom(this.responses.poeme);
        }
        if (/developpement web|projet.*web|planifier.*projet|site web|application web/i.test(lower)) {
            return this.pickRandom(this.responses.developpement_web);
        }
        if (/cybersecurite|securite|hacking|protection|mot de passe|phishing/i.test(lower)) {
            return this.pickRandom(this.responses.cybersecurite);
        }

        return this.pickRandom(this.responses.default);
    },

    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
};

// ========================================
// Conversation Management
// ========================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createConversation() {
    const conversation = {
        id: generateId(),
        title: 'Nouvelle conversation',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    state.conversations.unshift(conversation);
    state.currentConversationId = conversation.id;
    saveConversations();
    renderConversationList();
    showChat();
    clearMessages();
    elements.messageInput.focus();
    return conversation;
}

function deleteConversation(id) {
    state.conversations = state.conversations.filter(c => c.id !== id);
    if (state.currentConversationId === id) {
        state.currentConversationId = null;
        showWelcome();
    }
    saveConversations();
    renderConversationList();
}

function getCurrentConversation() {
    return state.conversations.find(c => c.id === state.currentConversationId);
}

function switchConversation(id) {
    state.currentConversationId = id;
    const conversation = getCurrentConversation();
    if (conversation) {
        showChat();
        renderMessages(conversation.messages);
    }
    renderConversationList();
    closeSidebar();
}

function updateConversationTitle(conversation) {
    if (conversation.messages.length === 1) {
        const firstMsg = conversation.messages[0].text;
        conversation.title = firstMsg.length > 30 ? firstMsg.substring(0, 30) + '...' : firstMsg;
        saveConversations();
        renderConversationList();
    }
}

function saveConversations() {
    localStorage.setItem('alexgpt-conversations', JSON.stringify(state.conversations));
}

// ========================================
// Message Handling
// ========================================

async function sendMessage() {
    const text = elements.messageInput.value.trim();
    if (!text || state.isGenerating) return;

    // Create conversation if needed
    if (!state.currentConversationId) {
        createConversation();
    }

    const conversation = getCurrentConversation();

    // Add user message
    const userMessage = {
        id: generateId(),
        role: 'user',
        text: text,
        timestamp: new Date().toISOString()
    };
    conversation.messages.push(userMessage);
    conversation.updatedAt = new Date().toISOString();
    updateConversationTitle(conversation);
    saveConversations();

    // Render user message
    appendMessage(userMessage);
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    updateSendButton();

    // Show typing indicator
    state.isGenerating = true;
    const typingEl = showTypingIndicator();
    scrollToBottom();

    // Simulate AI response with delay
    const responseText = AI.getResponse(text);
    const delay = Math.min(500 + responseText.length * 2, 3000);

    await sleep(delay);

    // Remove typing indicator
    typingEl.remove();
    state.isGenerating = false;

    // Add AI message
    const aiMessage = {
        id: generateId(),
        role: 'assistant',
        text: responseText,
        timestamp: new Date().toISOString()
    };
    conversation.messages.push(aiMessage);
    conversation.updatedAt = new Date().toISOString();
    saveConversations();

    // Render AI message with typing effect
    appendMessage(aiMessage, true);
    scrollToBottom();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// Rendering
// ========================================

function renderConversationList() {
    const list = elements.conversationList;
    list.innerHTML = '';

    if (state.conversations.length === 0) {
        list.innerHTML = '<p style="padding: 16px; color: var(--text-tertiary); font-size: 0.8rem; text-align: center;">Aucune conversation</p>';
        return;
    }

    // Group conversations by date
    const groups = groupConversationsByDate(state.conversations);

    for (const [label, conversations] of Object.entries(groups)) {
        const groupEl = document.createElement('div');
        groupEl.className = 'conversation-date-group';
        groupEl.textContent = label;
        list.appendChild(groupEl);

        conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item' + (conv.id === state.currentConversationId ? ' active' : '');
            item.innerHTML = `
                <span class="conversation-title">${escapeHtml(conv.title)}</span>
                <div class="conversation-actions">
                    <button class="conversation-action-btn delete-conv" title="Supprimer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;

            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-conv')) {
                    switchConversation(conv.id);
                }
            });

            const deleteBtn = item.querySelector('.delete-conv');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteConversation(conv.id);
            });

            list.appendChild(item);
        });
    }
}

function groupConversationsByDate(conversations) {
    const groups = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today - 86400000);
    const weekAgo = new Date(today - 7 * 86400000);

    conversations.forEach(conv => {
        const date = new Date(conv.updatedAt);
        let label;

        if (date >= today) label = "Aujourd'hui";
        else if (date >= yesterday) label = 'Hier';
        else if (date >= weekAgo) label = '7 derniers jours';
        else label = 'Plus ancien';

        if (!groups[label]) groups[label] = [];
        groups[label].push(conv);
    });

    return groups;
}

function appendMessage(message, animate = false) {
    const el = document.createElement('div');
    el.className = 'message';
    el.dataset.id = message.id;

    const isUser = message.role === 'user';
    const avatar = isUser ? 'A' : 'A';
    const avatarClass = isUser ? 'user' : 'ai';
    const sender = isUser ? 'Vous' : 'AlexGPT';

    el.innerHTML = `
        <div class="message-avatar ${avatarClass}">${avatar}</div>
        <div class="message-content">
            <div class="message-sender">${sender}</div>
            <div class="message-text">${formatMessage(message.text)}</div>
            ${!isUser ? `
            <div class="message-actions">
                <button class="message-action-btn copy-msg" title="Copier">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copier
                </button>
            </div>` : ''}
        </div>
    `;

    // Copy button handler
    const copyBtn = el.querySelector('.copy-msg');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(message.text).then(() => {
                copyBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Copié !
                `;
                setTimeout(() => {
                    copyBtn.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copier
                    `;
                }, 2000);
            });
        });
    }

    elements.messagesWrapper.appendChild(el);
    scrollToBottom();
}

function renderMessages(messages) {
    elements.messagesWrapper.innerHTML = '';
    messages.forEach(msg => appendMessage(msg));
    scrollToBottom();
}

function clearMessages() {
    elements.messagesWrapper.innerHTML = '';
}

function showTypingIndicator() {
    const el = document.createElement('div');
    el.className = 'message';
    el.id = 'typingIndicator';
    el.innerHTML = `
        <div class="message-avatar ai">A</div>
        <div class="message-content">
            <div class="message-sender">AlexGPT</div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    elements.messagesWrapper.appendChild(el);
    return el;
}

function formatMessage(text) {
    // Convert markdown-like syntax to HTML
    let html = escapeHtml(text);

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang}">${code.trim()}</code><button class="copy-code-btn" onclick="copyCode(this)">Copier</button></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');

    // Paragraphs (double newlines)
    html = html.replace(/\n\n/g, '</p><p>');

    // Single newlines within paragraphs
    html = html.replace(/\n/g, '<br>');

    return `<p>${html}</p>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy code block function
window.copyCode = function(btn) {
    const code = btn.previousElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copié !';
        setTimeout(() => btn.textContent = 'Copier', 2000);
    });
};

function scrollToBottom() {
    requestAnimationFrame(() => {
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    });
}

// ========================================
// UI State
// ========================================

function showWelcome() {
    elements.welcomeScreen.classList.remove('hidden');
    elements.messagesContainer.classList.remove('active');
}

function showChat() {
    elements.welcomeScreen.classList.add('hidden');
    elements.messagesContainer.classList.add('active');
}

function closeSidebar() {
    elements.sidebar.classList.remove('open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
}

function updateSendButton() {
    elements.sendBtn.disabled = !elements.messageInput.value.trim();
}

// ========================================
// Settings
// ========================================

function applySettings() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    document.documentElement.style.setProperty('--font-size', state.settings.fontSize + 'px');
    elements.fontSizeSelect.value = state.settings.fontSize;

    // Update theme buttons
    $$('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === state.settings.theme);
    });
}

function saveSettings() {
    localStorage.setItem('alexgpt-settings', JSON.stringify(state.settings));
}

// ========================================
// Event Listeners
// ========================================

function init() {
    // Apply settings
    applySettings();

    // Render conversations
    renderConversationList();

    // New chat
    elements.newChatBtn.addEventListener('click', () => {
        createConversation();
        closeSidebar();
    });

    // Send message
    elements.sendBtn.addEventListener('click', sendMessage);

    // Input handling
    elements.messageInput.addEventListener('input', () => {
        updateSendButton();
        // Auto-resize textarea
        elements.messageInput.style.height = 'auto';
        elements.messageInput.style.height = Math.min(elements.messageInput.scrollHeight, 200) + 'px';
    });

    elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Suggestion cards
    $$('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            elements.messageInput.value = card.dataset.prompt;
            updateSendButton();
            sendMessage();
        });
    });

    // Sidebar toggle (mobile)
    elements.sidebarToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('open');
        // Create/toggle overlay
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeSidebar);
        }
        overlay.classList.toggle('active');
    });

    // Settings
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.add('active');
    });

    elements.closeSettings.addEventListener('click', () => {
        elements.settingsModal.classList.remove('active');
    });

    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            elements.settingsModal.classList.remove('active');
        }
    });

    // Theme toggle
    $$('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.settings.theme = btn.dataset.theme;
            saveSettings();
            applySettings();
        });
    });

    // Font size
    elements.fontSizeSelect.addEventListener('change', () => {
        state.settings.fontSize = parseInt(elements.fontSizeSelect.value);
        saveSettings();
        applySettings();
    });

    // Clear all conversations
    elements.clearAllBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer toutes les conversations ?')) {
            state.conversations = [];
            state.currentConversationId = null;
            saveConversations();
            renderConversationList();
            showWelcome();
            clearMessages();
            elements.settingsModal.classList.remove('active');
        }
    });

    // Keyboard shortcut: Escape to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            elements.settingsModal.classList.remove('active');
            closeSidebar();
        }
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', init);

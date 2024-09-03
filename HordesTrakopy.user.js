// ==UserScript==
// @name         Hordes - Trakopy
// @description  Copie les pseudos, IDs et avatars des joueurs.
// @icon         https://myhordes.fr/build/images/emotes/last.ae495108.gif
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       Eliam
// @match        https://myhordes.fr/*
// @match        https://myhordes.de/*
// @match        https://myhordes.eu/*
// @match        https://myhord.es/*
// @updateURL    https://github.com/Croaaa/HordesTrakopy/raw/main/HordesTrakopy.user.js
// @downloadURL  https://github.com/Croaaa/HordesTrakopy/raw/main/HordesTrakopy.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Fonction pour copier les données des citoyens dans le presse-papiers
    function copyCitizensData() {
        const citizens = [];
        document.querySelectorAll('.row-flex.pointer').forEach(citizenRow => {
            const avatarElement = citizenRow.querySelector('.avatar');
            const usernameElement = citizenRow.querySelector('.username');
            const citizenId = usernameElement ? usernameElement.getAttribute('x-user-id') : null;
            const citizenName = usernameElement ? usernameElement.textContent.trim() : null;
            const avatarUrl = avatarElement ? avatarElement.style.backgroundImage.slice(5, -2) : null;

            if (citizenId && citizenName && avatarUrl) {
                citizens.push({
                    id: citizenId,
                    name: citizenName,
                    avatar: `https://myhordes.fr${avatarUrl}`
                });
            }
        });

        // Tri des citoyens par ID croissant
        citizens.sort((a, b) => a.id - b.id);

        if (citizens.length === 0) {
            alert("Aucun citoyen trouvé pour la copie.");
            return;
        }

        // Préparer les données pour la copie
        let resultText = 'Pseudo\tID\tAvatar URL\n';
        citizens.forEach(citizen => {
            resultText += `${citizen.name}\t${citizen.id}\t${citizen.avatar}\n`;
        });

        navigator.clipboard.writeText(resultText).then(() => {
            alert('Données citoyennes copiées dans le presse-papiers.');
        }).catch(err => {
            console.error('Erreur lors de la copie des données des citoyens : ', err);
            alert('Erreur lors de la copie des données des citoyens.');
        });
    }

    // Fonction pour créer le bouton de copie des données des citoyens
    function createCopyButton() {
        const copyButton = document.createElement('a');
        copyButton.className = 'small';
        copyButton.href = '#';
        copyButton.textContent = 'Copier les infos citoyennes';
        copyButton.style.marginRight = '8px';
        copyButton.setAttribute('data-trakopy-button', 'true');

        // Ajoute l'événement de copie
        copyButton.addEventListener('click', function(event) {
            event.preventDefault();
            copyCitizensData();
        });

        return copyButton;
    }

    // Fonction pour ajouter le bouton de copie à l'interface
    function addCopyButton() {
        if (document.querySelector('a[data-trakopy-button="true"]')) {
            return;
        }

        const referenceElement = document.querySelector('.row .padded.cell.rw-12.right');

        if (referenceElement) {
            const copyButton = createCopyButton();
            referenceElement.insertBefore(copyButton, referenceElement.firstChild);
        }
    }

    // Vérifie si l'URL correspond à celle où le script doit s'exécuter
    function checkAndAddButton() {
        if (window.location.pathname === '/jx/town/citizens') {
            addCopyButton();
        }
    }

    // Fonction pour observer les changements d'URL
    function observeUrlChanges() {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function(...args) {
            originalPushState.apply(this, args);
            logUrlChange();
        };

        history.replaceState = function(...args) {
            originalReplaceState.apply(this, args);
            logUrlChange();
        };

        window.addEventListener('popstate', logUrlChange);
    }

    // Fonction pour initialiser l'observateur de mutations et les changements d'URL
    function logUrlChange() {
        if (window.location.pathname.includes('/jx/town/citizens')) {
            if (!window.hasTrakopyButtonBeenInitialized) {
                window.hasTrakopyButtonBeenInitialized = true;
                const observer = new MutationObserver(addCopyButton);
                observer.observe(document.body, { childList: true, subtree: true });
                addCopyButton();
            }
        }
    }

    // Fonction principale à exécuter lors du chargement de la page
    function main() {
        observeUrlChanges();
        logUrlChange();
    }

    window.addEventListener('load', main);

})();

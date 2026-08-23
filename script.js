document.addEventListener('DOMContentLoaded', () => {
  const uploadPassword = 'HGYAK';
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const navLinks = [...document.querySelectorAll('.main-nav a')];

  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  const festivalDate = new Date('2026-09-14T19:30:00+05:30').getTime();
  const countdownUnits = { days: document.querySelector('#days'), hours: document.querySelector('#hours'), minutes: document.querySelector('#minutes'), seconds: document.querySelector('#seconds') };
  const updateCountdown = () => {
    const difference = Math.max(0, festivalDate - Date.now());
    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference / 3600000) % 24);
    const minutes = Math.floor((difference / 60000) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    Object.entries({ days, hours, minutes, seconds }).forEach(([unit, value]) => { countdownUnits[unit].textContent = String(value).padStart(2, '0'); });
  };
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightboxImage');
  const lightboxCaption = document.querySelector('#lightboxCaption');
  document.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', () => {
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = item.querySelector('img').alt;
    lightboxCaption.textContent = item.querySelector('span').textContent;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }));
  const closeLightbox = () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true'); lightboxImage.src = ''; };
  document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLightbox(); });

  const form = document.querySelector('#contactForm');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const status = document.querySelector('#contactStatus');
    if (!form.checkValidity()) { status.textContent = 'Please complete all fields with valid details.'; status.className = 'form-status error'; form.reportValidity(); return; }
    status.textContent = 'Thank you. This demo form is ready to connect to your email service.';
    status.className = 'form-status success';
    form.reset();
  });

  const joinForm = document.querySelector('#joinForm');
  joinForm.addEventListener('submit', event => {
    event.preventDefault();
    const status = document.querySelector('#joinStatus');
    if (!joinForm.checkValidity()) { status.textContent = 'Please add your name, email, phone and joining interest.'; status.className = 'form-status error'; joinForm.reportValidity(); return; }
    joinForm.action = 'https://formsubmit.co/gamplivignesh4@gmail.com';
    joinForm.method = 'POST';
    [['_subject', 'New joining request - Hanuman Ganesh Youth Association - Kangti'], ['_captcha', 'false'], ['_template', 'table']].forEach(([name, value]) => {
      const field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      field.value = value;
      joinForm.appendChild(field);
    });
    status.textContent = 'Sending your joining request...';
    status.className = 'form-status success';
    HTMLFormElement.prototype.submit.call(joinForm);
  });

  const contactDetails = document.querySelector('.contact-details');
  const contactInfo = document.querySelector('.contact-info');
  const contactStorageKey = 'hgyak-contact-numbers-v1';
  const defaultContactNumbers = ['6304757376', '7671049799', '7601030166', '9390062426', '8885691020', '8499096416'];
  const contactManageButton = document.createElement('button');
  contactManageButton.className = 'button button-outline member-manage-button';
  contactManageButton.type = 'button';
  contactManageButton.textContent = 'Manage contact numbers +';
  contactInfo.append(contactManageButton);
  const contactModal = document.createElement('div');
  contactModal.className = 'member-modal';
  contactModal.setAttribute('aria-hidden', 'true');
  contactModal.innerHTML = '<form class="member-modal-form"><button class="member-modal-close" type="button" aria-label="Close">×</button><h3>Manage contact numbers</h3><p class="member-modal-intro">Enter the password to show add, edit and remove options.</p><label>Password<input class="member-password" type="password" required autocomplete="off"></label><div class="member-fields" hidden><label>Mobile number<input class="contact-number" type="tel" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" required placeholder="10-digit mobile number"></label></div><p class="form-status error member-status" role="status"></p><div class="member-modal-actions"><button class="button button-outline member-cancel" type="button">Cancel</button><button class="button button-primary contact-unlock" type="button">Unlock options</button><button class="button button-primary member-submit" type="submit" hidden>Save number</button></div></form></div>';
  document.body.append(contactModal);
  const contactForm = contactModal.querySelector('.member-modal-form');
  const contactPassword = contactModal.querySelector('.member-password');
  const contactNumber = contactModal.querySelector('.contact-number');
  const contactFields = contactModal.querySelector('.member-fields');
  const contactStatus = contactModal.querySelector('.member-status');
  const contactUnlock = contactModal.querySelector('.contact-unlock');
  const contactSubmit = contactModal.querySelector('.member-submit');
  let contactAction = 'add';
  let editingContactIndex = null;
  let contactOptionsUnlocked = false;
  const getContactNumbers = () => { try { const numbers = JSON.parse(localStorage.getItem(contactStorageKey) || JSON.stringify(defaultContactNumbers)); return Array.isArray(numbers) ? numbers : defaultContactNumbers; } catch { return defaultContactNumbers; } };
  const saveContactNumbers = numbers => localStorage.setItem(contactStorageKey, JSON.stringify(numbers));
  const closeContactModal = () => { contactModal.classList.remove('open'); contactModal.setAttribute('aria-hidden', 'true'); contactForm.reset(); contactStatus.textContent = ''; contactFields.hidden = true; contactSubmit.hidden = true; contactUnlock.hidden = false; };
  const openContactModal = (action = 'add', index = null) => { contactAction = action; editingContactIndex = index; contactNumber.value = index === null ? '' : getContactNumbers()[index]; contactSubmit.textContent = action === 'add' ? 'Add number' : action === 'edit' ? 'Save changes' : 'Remove number'; contactFields.hidden = action === 'remove'; contactNumber.required = action !== 'remove'; contactSubmit.hidden = false; contactUnlock.hidden = true; contactModal.classList.add('open'); contactModal.setAttribute('aria-hidden', 'false'); contactPassword.focus(); };
  const renderContactNumbers = () => { const phoneBlock = contactDetails.children[1]; phoneBlock.innerHTML = '<span class="detail-icon">✆</span><p><b>Call or WhatsApp</b><span class="contact-phone-list"></span></p>'; const phoneList = phoneBlock.querySelector('.contact-phone-list'); getContactNumbers().forEach((number, index) => { const link = document.createElement('a'); link.href = `https://wa.me/91${number}`; link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = `+91 ${number}`; phoneList.append(link); if (contactOptionsUnlocked) { const actions = document.createElement('span'); actions.className = 'member-actions'; const edit = document.createElement('button'); edit.className = 'member-action'; edit.type = 'button'; edit.textContent = 'Edit'; edit.addEventListener('click', () => openContactModal('edit', index)); const remove = document.createElement('button'); remove.className = 'member-action member-remove'; remove.type = 'button'; remove.textContent = 'Remove'; remove.addEventListener('click', () => openContactModal('remove', index)); actions.append(edit, remove); phoneList.append(actions); } }); };
  contactManageButton.addEventListener('click', () => { if (contactOptionsUnlocked) { openContactModal('add'); return; } contactModal.classList.add('open'); contactModal.setAttribute('aria-hidden', 'false'); contactPassword.focus(); });
  contactUnlock.addEventListener('click', () => { if (contactPassword.value !== uploadPassword) { contactStatus.textContent = 'Incorrect password.'; contactPassword.select(); return; } contactOptionsUnlocked = true; closeContactModal(); renderContactNumbers(); });
  contactForm.addEventListener('submit', event => { event.preventDefault(); if (contactPassword.value !== uploadPassword) { contactStatus.textContent = 'Incorrect password.'; contactPassword.select(); return; } const numbers = getContactNumbers(); if (contactAction === 'remove') numbers.splice(editingContactIndex, 1); else if (contactAction === 'edit') numbers[editingContactIndex] = contactNumber.value.trim(); else numbers.push(contactNumber.value.trim()); saveContactNumbers(numbers); closeContactModal(); renderContactNumbers(); });
  contactModal.querySelector('.member-modal-close').addEventListener('click', closeContactModal);
  contactModal.querySelector('.member-cancel').addEventListener('click', closeContactModal);
  contactModal.addEventListener('click', event => { if (event.target === contactModal) closeContactModal(); });
  renderContactNumbers();

  const paymentQrSlot = document.querySelector('.payment-qr-slot');
  const paymentQrImage = paymentQrSlot.querySelector('.payment-qr-image');
  const paymentQrPlaceholder = paymentQrSlot.querySelector('.payment-qr-placeholder');
  const paymentQrManage = paymentQrSlot.querySelector('.payment-qr-manage');
  const paymentQrInput = document.createElement('input'); paymentQrInput.type = 'file'; paymentQrInput.accept = 'image/jpeg,image/png,image/webp'; paymentQrInput.hidden = true; paymentQrSlot.append(paymentQrInput);
  const paymentQrStorageKey = 'hgyak-payment-qr';
  const paymentQrChangesKey = 'hgyak-payment-qr-changes';
  let paymentQrUnlocked = false;
  const getPaymentQrChanges = () => { try { return JSON.parse(localStorage.getItem(paymentQrChangesKey) || '[]').filter(time => Date.now() - time < 86400000); } catch { return []; } };
  const canChangePaymentQr = () => true;
  const recordPaymentQrChange = () => { const changes = getPaymentQrChanges(); changes.push(Date.now()); localStorage.setItem(paymentQrChangesKey, JSON.stringify(changes)); };
  const renderPaymentQr = () => { const savedQr = localStorage.getItem(paymentQrStorageKey); paymentQrImage.hidden = !savedQr; paymentQrPlaceholder.hidden = Boolean(savedQr); if (savedQr) paymentQrImage.src = savedQr; paymentQrManage.textContent = paymentQrUnlocked ? (savedQr ? 'Replace payment QR' : 'Add payment QR') : 'Manage payment QR +'; paymentQrSlot.querySelector('.payment-qr-actions')?.remove(); if (!paymentQrUnlocked) return; const actions = document.createElement('div'); actions.className = 'payment-qr-actions'; const replace = document.createElement('button'); replace.className = 'button button-primary'; replace.type = 'button'; replace.textContent = savedQr ? 'Edit / replace' : 'Add QR'; replace.addEventListener('click', () => { if (!canChangePaymentQr()) { window.alert('Payment QR change limit reached. Try again after 24 hours.'); return; } paymentQrInput.click(); }); actions.append(replace); if (savedQr) { const remove = document.createElement('button'); remove.className = 'button button-outline'; remove.type = 'button'; remove.textContent = 'Remove QR'; remove.addEventListener('click', () => { if (!canChangePaymentQr()) { window.alert('Payment QR change limit reached. Try again after 24 hours.'); return; } localStorage.removeItem(paymentQrStorageKey); recordPaymentQrChange(); renderPaymentQr(); }); actions.append(remove); } paymentQrSlot.append(actions); };
  const unlockPaymentQr = () => { paymentQrUnlocked = true; renderPaymentQr(); };
  paymentQrManage.addEventListener('click', () => { if (paymentQrUnlocked) { renderPaymentQr(); return; } if (window.prompt('Enter password to manage payment QR:') === uploadPassword) unlockPaymentQr(); else window.alert('Incorrect password.'); });
  paymentQrInput.addEventListener('change', () => { const file = paymentQrInput.files[0]; if (!file || !file.type.startsWith('image/')) { window.alert('Please choose a QR image.'); paymentQrInput.value = ''; return; } if (!canChangePaymentQr()) { window.alert('Payment QR change limit reached. Try again after 24 hours.'); paymentQrInput.value = ''; return; } const reader = new FileReader(); reader.addEventListener('load', () => { localStorage.setItem(paymentQrStorageKey, reader.result); recordPaymentQrChange(); renderPaymentQr(); paymentQrInput.value = ''; }); reader.readAsDataURL(file); });
  renderPaymentQr();

  const storyButton = document.querySelector('#playStory');
  const storyStatus = document.querySelector('#storyStatus');
  const storyLanguage = document.createElement('select');
  storyLanguage.className = 'story-language';
  storyLanguage.style.cssText = 'margin-right:10px;padding:12px;border:1px solid var(--line);background:var(--paper);color:var(--ink);font:inherit;font-size:12px;';
  storyLanguage.setAttribute('aria-label', 'Story language');
  [['te-IN', 'తెలుగు'], ['hi-IN', 'हिन्दी'], ['kn-IN', 'ಕನ್ನಡ'], ['en-IN', 'English']].forEach(([value, label]) => { const option = document.createElement('option'); option.value = value; option.textContent = label; storyLanguage.append(option); });
  storyButton.parentElement.insertBefore(storyLanguage, storyButton);
  const storyTexts = { 'en-IN': document.querySelector('.story-text').textContent, 'te-IN': 'చాలా కాలం క్రితం, పార్వతి తన భక్తితో పవిత్రమైన మట్టి మరియు చందనంతో ఒక బాలుడిని రూపొందించింది. ఆమె అతనికి ప్రాణం పోసి, తన ఇంటిని కాపాడమని చెప్పింది. గణేశుడు ధైర్యం, జ్ఞానం మరియు ప్రేమకు ప్రతీకగా మారాడు. ప్రతి సంవత్సరం కుటుంబాలు గణేశుడిని ఇంటికి ఆహ్వానించి, పూలు మరియు మోదకాలు సమర్పించి, కలిసి పాటలు పాడుతారు. పది రోజుల పాటు భక్తి, సేవ మరియు ఆనందం సమాజాన్ని కలుపుతాయి. చివరగా గణేశుడిని ఘనంగా వీడ్కోలు పలుకుతూ, జ్ఞానం మరియు దయతో కొత్త ప్రారంభాలను స్వాగతిస్తామని ప్రతిజ్ఞ చేస్తాము. గణపతి బప్పా మోరియా.', 'hi-IN': 'बहुत समय पहले, पार्वती ने अपनी भक्ति से पवित्र मिट्टी और चंदन से एक बालक बनाया। उन्होंने उसे जीवन दिया और अपने घर की रक्षा करने को कहा। गणेश साहस, ज्ञान और प्रेम के प्रतीक बन गए। हर वर्ष परिवार गणेश जी का स्वागत करते हैं, फूल और मोदक चढ़ाते हैं और साथ मिलकर भजन गाते हैं। दस दिनों तक भक्ति, सेवा और आनंद पूरे समुदाय को जोड़ते हैं। अंत में गणेश जी को प्रेम से विदा करते हुए हम ज्ञान और दया के साथ नई शुरुआत करने का संकल्प लेते हैं। गणपति बप्पा मोरया।', 'kn-IN': 'ಬಹಳ ವರ್ಷಗಳ ಹಿಂದೆ, ಪಾರ್ವತಿಯವರು ತಮ್ಮ ಭಕ್ತಿಯಿಂದ ಪವಿತ್ರ ಮಣ್ಣು ಮತ್ತು ಚಂದನದಿಂದ ಒಬ್ಬ ಬಾಲಕನನ್ನು ರೂಪಿಸಿದರು. ಅವರಿಗೆ ಜೀವ ನೀಡಿ ತಮ್ಮ ಮನೆಯ ರಕ್ಷಣೆಯನ್ನು ವಹಿಸಿದರು. ಗಣೇಶರು ಧೈರ್ಯ, ಜ್ಞಾನ ಮತ್ತು ಪ್ರೀತಿಯ ಪ್ರತೀಕವಾದರು. ಪ್ರತಿವರ್ಷ ಕುಟುಂಬಗಳು ಗಣೇಶನನ್ನು ಮನೆಗೆ ಆಹ್ವಾನಿಸಿ, ಹೂವು ಮತ್ತು ಮೋದಕಗಳನ್ನು ಅರ್ಪಿಸಿ, ಒಟ್ಟಾಗಿ ಹಾಡುತ್ತವೆ. ಹತ್ತು ದಿನಗಳ ಭಕ್ತಿ, ಸೇವೆ ಮತ್ತು ಸಂತೋಷವು ಸಮುದಾಯವನ್ನು ಒಂದಾಗಿಸುತ್ತದೆ. ಕೊನೆಯಲ್ಲಿ ಗಣೇಶನಿಗೆ ಪ್ರೀತಿಯಿಂದ ವಿದಾಯ ಹೇಳುತ್ತಾ, ಜ್ಞಾನ ಮತ್ತು ದಯೆಯಿಂದ ಹೊಸ ಆರಂಭಗಳನ್ನು ಸ್ವಾಗತಿಸುವ ಸಂಕಲ್ಪ ಮಾಡುತ್ತೇವೆ. ಗಣಪತಿ ಬಪ್ಪಾ ಮೋರಿಯಾ.' };
  let storyPlaying = false;
  const preferredStoryVoice = language => { const voices = window.speechSynthesis.getVoices(); const languageVoice = voices.find(voice => voice.lang.toLowerCase().startsWith(language.slice(0, 2).toLowerCase())); return languageVoice || voices.find(voice => /female|girl|samantha|zira|heera|priya|kalpana|google uk english female|microsoft.*female/i.test(voice.name)) || voices[0]; };
  storyButton.addEventListener('click', () => { if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') { storyStatus.textContent = 'Story audio is not supported in this browser.'; return; } if (storyPlaying) { window.speechSynthesis.cancel(); storyPlaying = false; storyButton.innerHTML = 'Play story <span>▶</span>'; storyStatus.textContent = 'Story stopped.'; return; } const language = storyLanguage.value; const voice = preferredStoryVoice(language); const narration = new SpeechSynthesisUtterance(storyTexts[language]); narration.lang = voice ? voice.lang : 'en-US'; if (voice) narration.voice = voice; narration.rate = .84; narration.pitch = 1.28; narration.onstart = () => { storyPlaying = true; storyButton.innerHTML = 'Stop story <span>■</span>'; storyStatus.textContent = voice && voice.lang.toLowerCase().startsWith(language.slice(0, 2).toLowerCase()) ? 'Playing in the selected language...' : 'Playing with the available browser voice...'; }; narration.onerror = () => { storyPlaying = false; storyButton.innerHTML = 'Play story <span>▶</span>'; storyStatus.textContent = 'The browser could not start story audio.'; }; narration.onend = () => { storyPlaying = false; storyButton.innerHTML = 'Play story <span>▶</span>'; storyStatus.textContent = 'Story complete.'; }; window.speechSynthesis.cancel(); window.speechSynthesis.resume(); window.setTimeout(() => window.speechSynthesis.speak(narration), 80); });

  const storyMovie = document.querySelector('#storyMovie');
  const storyMovieManage = document.querySelector('#storyMovieManage');
  const storyMoviePlaceholder = document.querySelector('.story-movie-placeholder');
  const storyMovieInput = document.createElement('input'); storyMovieInput.type = 'file'; storyMovieInput.accept = 'video/mp4,video/webm,video/ogg'; storyMovieInput.hidden = true; document.querySelector('.story-movie').append(storyMovieInput);
  const storyMovieStorageKey = 'hgyak-story-movie';
  const renderStoryMovie = () => { const savedMovie = localStorage.getItem(storyMovieStorageKey); storyMovie.hidden = !savedMovie; storyMoviePlaceholder.hidden = Boolean(savedMovie); if (savedMovie) storyMovie.src = savedMovie; storyMovieManage.textContent = savedMovie ? 'Replace story movie' : 'Add story movie +'; };
  storyMovieManage.addEventListener('click', () => { if (window.prompt('Enter password to manage story movie:') === uploadPassword) storyMovieInput.click(); else window.alert('Incorrect password.'); });
  storyMovieInput.addEventListener('change', () => { const file = storyMovieInput.files[0]; if (!file || !file.type.startsWith('video/')) { window.alert('Please choose a video file.'); storyMovieInput.value = ''; return; } const reader = new FileReader(); reader.addEventListener('load', () => { try { localStorage.setItem(storyMovieStorageKey, reader.result); renderStoryMovie(); } catch { window.alert('This video is too large to save in this browser.'); } storyMovieInput.value = ''; }); reader.readAsDataURL(file); });
  renderStoryMovie();

  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  const sections = [...document.querySelectorAll('main section[id]')];
  const activeObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)); } }), { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(section => activeObserver.observe(section));
});

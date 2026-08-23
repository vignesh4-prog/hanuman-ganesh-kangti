document.addEventListener('DOMContentLoaded', () => {
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

  const musicToggle = document.querySelector('#musicToggle');
  const musicMuteToggle = document.querySelector('#musicMuteToggle');
  const musicManageAction = document.querySelector('#musicManageAction');
  const songUploadAction = document.querySelector('#songUploadAction');
  const songUploadInput = document.querySelector('#songUploadInput');
  const savedSongKey = 'hgyak-devotional-song';
  let musicPlaying = false;
  let musicMuted = false;
  let songAudio;
  const startMusic = () => {
    const savedSong = localStorage.getItem(savedSongKey);
    if (!savedSong) return;
    songAudio = songAudio || new Audio(savedSong);
    songAudio.loop = true;
    songAudio.muted = musicMuted;
    songAudio.play().then(() => { musicPlaying = true; musicToggle.innerHTML = 'Pause your song <span>||</span>'; }).catch(() => {});
  };
  const stopMusic = () => { musicPlaying = false; if (songAudio) songAudio.pause(); musicToggle.innerHTML = 'Play your song <span>♪</span>'; };
  musicMuteToggle.addEventListener('click', () => { musicMuted = !musicMuted; if (songAudio) songAudio.muted = musicMuted; musicMuteToggle.innerHTML = `${musicMuted ? 'Unmute' : 'Mute'} music <span>${musicMuted ? '🔇' : '🔊'}</span>`; });
  musicToggle.addEventListener('click', () => { if (musicPlaying) stopMusic(); else startMusic(); });

  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightboxImage');
  const lightboxCaption = document.querySelector('#lightboxCaption');
  const galleryManageActions = document.querySelector('#galleryManageActions');
  let activeGalleryItem = null;
  const openGalleryImage = item => {
    activeGalleryItem = item;
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = item.querySelector('img').alt;
    lightboxCaption.textContent = item.querySelector('span').textContent;
    galleryManageActions.hidden = !item.classList.contains('uploaded-gallery-item');
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  };
  document.querySelectorAll('.gallery-item:not(.gallery-upload), .image-frame').forEach(item => {
    item.addEventListener('click', () => openGalleryImage(item));
    item.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openGalleryImage(item); } });
  });

  const uploadSlot = document.querySelector('#galleryUploadSlot');
  const uploadInput = document.querySelector('#galleryUploadInput');
  const uploadPassword = 'HGYAK';
  const savedGalleryPhotos = 'hgyak-gallery-photos';
  const savedHomeVideos = 'hgyak-home-videos';
  const homeVideoSources = ['https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4'];
  const homeFrameImage = document.querySelector('#homeFrameImage');
  const homeFrameVideo = document.querySelector('#homeFrameVideo');
  const homeVideoInput = document.querySelector('#homeVideoInput');
  const homeVideoUploadAction = document.querySelector('#homeVideoUploadAction');
  const maxGalleryImages = 40;
  const fixedGalleryImages = 9;
  let pendingUploadAction = 'add';
  const passwordModal = document.querySelector('#galleryPasswordModal');
  const passwordForm = document.querySelector('#galleryPasswordForm');
  const passwordInput = document.querySelector('#galleryPasswordInput');
  const passwordStatus = document.querySelector('#galleryPasswordStatus');
  const passwordHeading = passwordModal.querySelector('h3');
  const passwordIntro = passwordModal.querySelector('p');
  const defaultPasswordHeading = passwordHeading.textContent;
  const defaultPasswordIntro = passwordIntro.textContent;
  const closePasswordModal = () => { passwordModal.classList.remove('open'); passwordModal.setAttribute('aria-hidden', 'true'); passwordForm.reset(); passwordStatus.textContent = ''; passwordHeading.textContent = defaultPasswordHeading; passwordIntro.textContent = defaultPasswordIntro; };
  const requestGalleryUpload = action => { pendingUploadAction = action || 'add'; passwordModal.classList.add('open'); passwordModal.setAttribute('aria-hidden', 'false'); passwordInput.focus(); };
  document.querySelector('#galleryUploadAction').addEventListener('click', requestGalleryUpload);
  passwordForm.addEventListener('submit', event => {
    event.preventDefault();
    if (passwordInput.value !== uploadPassword) { passwordStatus.textContent = 'Incorrect password.'; passwordInput.select(); return; }
    closePasswordModal();
    if (pendingUploadAction === 'music-unlock') { songUploadAction.hidden = false; return; }
    if (pendingUploadAction === 'song-upload') { songUploadInput.click(); return; }
    if (pendingUploadAction === 'home-video') { homeVideoInput.click(); return; }
    if (pendingUploadAction === 'payment-qr') { unlockPaymentQr(); return; }
    if (pendingUploadAction === 'story-movie') { storyMovieInput.click(); return; }
    if (pendingUploadAction === 'remove') { removeUploadedPhoto(); return; }
    uploadInput.click();
  });
  document.querySelector('#galleryPasswordCancel').addEventListener('click', closePasswordModal);
  document.querySelector('#galleryPasswordCancelAction').addEventListener('click', closePasswordModal);
  passwordModal.addEventListener('click', event => { if (event.target === passwordModal) closePasswordModal(); });
  songUploadAction.addEventListener('click', event => { event.stopPropagation(); pendingUploadAction = 'song-upload'; passwordHeading.textContent = 'Add devotional song'; passwordIntro.textContent = 'Enter the password to choose your song.'; passwordModal.classList.add('open'); passwordModal.setAttribute('aria-hidden', 'false'); passwordInput.focus(); });
  musicManageAction.addEventListener('click', event => { event.stopPropagation(); pendingUploadAction = 'music-unlock'; passwordHeading.textContent = 'Unlock music controls'; passwordIntro.textContent = 'Enter the password to add your own song.'; passwordModal.classList.add('open'); passwordModal.setAttribute('aria-hidden', 'false'); passwordInput.focus(); });
  songUploadInput.addEventListener('change', () => {
    const file = songUploadInput.files[0];
    if (!file || !file.type.startsWith('audio/')) { window.alert('Please choose an audio file.'); songUploadInput.value = ''; return; }
    const reader = new FileReader();
    reader.addEventListener('load', () => { try { localStorage.setItem(savedSongKey, reader.result); stopMusic(); songAudio = new Audio(reader.result); musicToggle.hidden = false; musicMuteToggle.hidden = false; songUploadAction.hidden = false; startMusic(); songUploadAction.innerHTML = 'Change song <span>+</span>'; } catch { window.alert('This song is too large to save in this browser.'); } songUploadInput.value = ''; });
    reader.readAsDataURL(file);
  });
  const showHomeVideo = source => { homeFrameVideo.src = source; homeFrameVideo.hidden = false; homeFrameImage.hidden = true; homeFrameVideo.play().catch(() => {}); };
  const savedHomeVideoList = () => { try { const videos = JSON.parse(localStorage.getItem(savedHomeVideos) || '[]'); return Array.isArray(videos) ? videos : []; } catch { return []; } };
  const homeVideos = savedHomeVideoList();
  showHomeVideo((homeVideos.length ? homeVideos : homeVideoSources)[Math.floor(Math.random() * (homeVideos.length ? homeVideos : homeVideoSources).length)]);
  homeVideoUploadAction.addEventListener('click', event => { event.stopPropagation(); pendingUploadAction = 'home-video'; passwordHeading.textContent = 'Manage home videos'; passwordIntro.textContent = 'Enter the password to add videos to the Ganapati Bappa frame.'; passwordModal.classList.add('open'); passwordModal.setAttribute('aria-hidden', 'false'); passwordInput.focus(); });
  homeVideoInput.addEventListener('change', () => {
    const files = [...homeVideoInput.files].filter(file => file.type.startsWith('video/'));
    if (!files.length) { window.alert('Please choose video files.'); homeVideoInput.value = ''; return; }
    const videos = savedHomeVideoList();
    files.forEach(file => { const reader = new FileReader(); reader.addEventListener('load', () => { videos.push(reader.result); try { localStorage.setItem(savedHomeVideos, JSON.stringify(videos)); showHomeVideo(reader.result); } catch { videos.pop(); window.alert('This video is too large to save in this browser.'); } }); reader.readAsDataURL(file); });
    homeVideoInput.value = '';
  });
  const renderUploadedPhotos = photos => {
    document.querySelectorAll('.uploaded-gallery-item').forEach(item => item.remove());
    photos.forEach((dataUrl, index) => {
      const item = document.createElement('button');
      item.className = 'gallery-item uploaded-gallery-item reveal visible';
      item.type = 'button';
      item.dataset.full = dataUrl;
      const image = document.createElement('img');
      image.src = dataUrl;
      image.alt = `Uploaded Ganesh festival photo ${index + 1}`;
      const caption = document.createElement('span');
      caption.textContent = `${String(fixedGalleryImages + index + 1).padStart(2, '0')} · Community photo`;
      item.append(image, caption);
      item.addEventListener('click', () => openGalleryImage(item));
      item.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openGalleryImage(item); } });
      uploadSlot.parentElement.insertBefore(item, uploadSlot);
    });
    const canAddMore = fixedGalleryImages + photos.length < maxGalleryImages;
    uploadSlot.hidden = !canAddMore;
    document.querySelector('#galleryUploadAction').hidden = !canAddMore;
  };
  uploadSlot.onclick = requestGalleryUpload;
  document.querySelector('#replaceGalleryPhoto').addEventListener('click', () => { closeLightbox(); requestGalleryUpload('replace'); });
  document.querySelector('#removeGalleryPhoto').addEventListener('click', () => { closeLightbox(); requestGalleryUpload('remove'); });
  uploadInput.addEventListener('change', () => {
    const files = [...uploadInput.files].filter(file => file.type.startsWith('image/'));
    if (!files.length) { window.alert('Please choose image files.'); uploadInput.value = ''; return; }
    let photos = [];
    try { photos = JSON.parse(localStorage.getItem(savedGalleryPhotos) || '[]'); } catch { photos = []; }
    if (pendingUploadAction === 'replace' && activeGalleryItem) {
      const itemIndex = [...document.querySelectorAll('.uploaded-gallery-item')].indexOf(activeGalleryItem);
      const reader = new FileReader();
      reader.addEventListener('load', () => { if (itemIndex >= 0) { photos[itemIndex] = reader.result; localStorage.setItem(savedGalleryPhotos, JSON.stringify(photos)); renderUploadedPhotos(photos); } });
      reader.readAsDataURL(files[0]);
      uploadInput.value = '';
      return;
    }
    const availableSlots = maxGalleryImages - fixedGalleryImages - photos.length;
    files.slice(0, availableSlots).forEach(file => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        photos.push(reader.result);
        try { localStorage.setItem(savedGalleryPhotos, JSON.stringify(photos)); renderUploadedPhotos(photos); }
        catch { photos.pop(); window.alert('This image is too large to save in this browser.'); }
      });
      reader.readAsDataURL(file);
    });
    if (files.length > availableSlots) window.alert(`Only ${availableSlots} more image${availableSlots === 1 ? '' : 's'} can be added. The gallery limit is ${maxGalleryImages}.`);
    uploadInput.value = '';
  });
  try {
    const savedValue = localStorage.getItem(savedGalleryPhotos);
    const legacyPhoto = localStorage.getItem('hgyak-gallery-photo');
    if (!savedValue && legacyPhoto) localStorage.setItem(savedGalleryPhotos, JSON.stringify([legacyPhoto]));
    const photos = savedValue ? JSON.parse(savedValue) : [];
    renderUploadedPhotos(Array.isArray(photos) ? photos : []);
  } catch { renderUploadedPhotos([]); }
  function removeUploadedPhoto() {
    if (!activeGalleryItem) return;
    const itemIndex = [...document.querySelectorAll('.uploaded-gallery-item')].indexOf(activeGalleryItem);
    let photos = [];
    try { photos = JSON.parse(localStorage.getItem(savedGalleryPhotos) || '[]'); } catch { photos = []; }
    if (itemIndex >= 0) { photos.splice(itemIndex, 1); localStorage.setItem(savedGalleryPhotos, JSON.stringify(photos)); renderUploadedPhotos(photos); }
    activeGalleryItem = null;
  }
  const closeLightbox = () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true'); lightboxImage.src = ''; galleryManageActions.hidden = true; };
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

  const peopleGrid = document.querySelector('.people-grid');
  const committeeHeading = document.querySelector('#committee .section-heading');
  const memberStorageKey = 'hgyak-community-members-v2';
  const legacyMemberStorageKey = 'hgyak-community-members';
  const memberButton = document.createElement('button');
  memberButton.className = 'button button-primary member-manage-button';
  memberButton.type = 'button';
  memberButton.textContent = 'Manage members +';
  committeeHeading.append(memberButton);
  const memberModal = document.createElement('div');
  memberModal.className = 'member-modal';
  memberModal.setAttribute('aria-hidden', 'true');
  memberModal.innerHTML = '<form class="member-modal-form"><button class="member-modal-close" type="button" aria-label="Close">×</button><h3>Manage community members</h3><p class="member-modal-intro">Add a member name and role, or manage members you added here.</p><label>Password<input class="member-password" type="password" required autocomplete="off"></label><div class="member-fields"><label>Name<input class="member-name" type="text" required></label><label>Role<input class="member-role" type="text" required placeholder="Member or Administrator"></label></div><p class="form-status error member-status" role="status"></p><div class="member-modal-actions"><button class="button button-outline member-cancel" type="button">Cancel</button><button class="button button-primary member-submit" type="submit">Add member</button></div></form></div>';
  document.body.append(memberModal);
  const memberForm = memberModal.querySelector('.member-modal-form');
  const memberPassword = memberModal.querySelector('.member-password');
  const memberName = memberModal.querySelector('.member-name');
  const memberRole = memberModal.querySelector('.member-role');
  const memberStatus = memberModal.querySelector('.member-status');
  const memberSubmit = memberModal.querySelector('.member-submit');
  let memberAction = 'add';
  let editingMemberId = null;
  let memberOptionsUnlocked = false;
  const getMembers = () => { try { const members = JSON.parse(localStorage.getItem(memberStorageKey) || '[]'); return Array.isArray(members) ? members : []; } catch { return []; } };
  const saveMembers = members => localStorage.setItem(memberStorageKey, JSON.stringify(members));
  const initializeMembers = () => {
    if (localStorage.getItem(memberStorageKey)) return;
    const existingMembers = [...peopleGrid.querySelectorAll('.person')].map((card, index) => ({ id: `original-${index}`, name: card.querySelector('h3').textContent.trim(), role: card.querySelector('.role').textContent.trim() }));
    let legacyMembers = [];
    try { legacyMembers = JSON.parse(localStorage.getItem(legacyMemberStorageKey) || '[]'); } catch { legacyMembers = []; }
    saveMembers(existingMembers.concat(Array.isArray(legacyMembers) ? legacyMembers : []));
  };
  const closeMemberModal = () => { memberModal.classList.remove('open'); memberModal.setAttribute('aria-hidden', 'true'); memberForm.reset(); memberStatus.textContent = ''; };
  const openMemberModal = (action = 'add', member = null) => {
    memberAction = action;
    editingMemberId = member ? member.id : null;
    memberName.value = member ? member.name : '';
    memberRole.value = member ? member.role : '';
    memberSubmit.textContent = action === 'add' ? 'Add member' : action === 'edit' ? 'Save changes' : 'Remove member';
    memberModal.querySelector('.member-fields').hidden = action === 'remove';
    memberName.required = action !== 'remove';
    memberRole.required = action !== 'remove';
    memberModal.classList.add('open');
    memberModal.setAttribute('aria-hidden', 'false');
    memberPassword.focus();
  };
  const renderMembers = () => {
    peopleGrid.querySelectorAll('.person').forEach(member => member.remove());
    getMembers().forEach(member => {
      const card = document.createElement('article');
      card.className = 'person managed-member';
      const name = document.createElement('h3');
      name.textContent = member.name;
      const role = document.createElement('span');
      role.className = 'role';
      role.textContent = member.role;
      card.append(name, role);
      if (memberOptionsUnlocked) {
        const actions = document.createElement('div');
        actions.className = 'member-actions';
        const edit = document.createElement('button');
        edit.className = 'member-action';
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => openMemberModal('edit', member));
        const remove = document.createElement('button');
        remove.className = 'member-action member-remove';
        remove.type = 'button';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => openMemberModal('remove', member));
        actions.append(edit, remove);
        card.append(actions);
      }
      peopleGrid.append(card);
    });
  };
  memberButton.addEventListener('click', () => openMemberModal());
  const unlockButton = document.createElement('button');
  unlockButton.className = 'button button-outline member-unlock';
  unlockButton.type = 'button';
  unlockButton.textContent = 'Unlock edit options';
  memberModal.querySelector('.member-modal-actions').prepend(unlockButton);
  unlockButton.addEventListener('click', () => {
    if (memberPassword.value !== uploadPassword) { memberStatus.textContent = 'Incorrect password.'; memberPassword.select(); return; }
    memberOptionsUnlocked = true;
    closeMemberModal();
    renderMembers();
  });
  memberForm.addEventListener('submit', event => {
    event.preventDefault();
    if (memberPassword.value !== uploadPassword) { memberStatus.textContent = 'Incorrect password.'; memberPassword.select(); return; }
    const members = getMembers();
    if (memberAction === 'remove') saveMembers(members.filter(member => member.id !== editingMemberId));
    else if (memberAction === 'edit') { const member = members.find(item => item.id === editingMemberId); if (member) { member.name = memberName.value.trim(); member.role = memberRole.value.trim(); } saveMembers(members); }
    else { members.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: memberName.value.trim(), role: memberRole.value.trim() }); saveMembers(members); }
    closeMemberModal();
    renderMembers();
  });
  memberModal.querySelector('.member-modal-close').addEventListener('click', closeMemberModal);
  memberModal.querySelector('.member-cancel').addEventListener('click', closeMemberModal);
  memberModal.addEventListener('click', event => { if (event.target === memberModal) closeMemberModal(); });
  initializeMembers();
  renderMembers();

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
  const renderContactNumbers = () => {
    const phoneBlock = contactDetails.children[1];
    phoneBlock.innerHTML = '<span class="detail-icon">✆</span><p><b>Call or WhatsApp</b><span class="contact-phone-list"></span></p>';
    const phoneList = phoneBlock.querySelector('.contact-phone-list');
    getContactNumbers().forEach((number, index) => { const link = document.createElement('a'); link.href = `https://wa.me/91${number}`; link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = `+91 ${number}`; phoneList.append(link); if (contactOptionsUnlocked) { const actions = document.createElement('span'); actions.className = 'member-actions'; const edit = document.createElement('button'); edit.className = 'member-action'; edit.type = 'button'; edit.textContent = 'Edit'; edit.addEventListener('click', () => openContactModal('edit', index)); const remove = document.createElement('button'); remove.className = 'member-action member-remove'; remove.type = 'button'; remove.textContent = 'Remove'; remove.addEventListener('click', () => openContactModal('remove', index)); actions.append(edit, remove); phoneList.append(actions); } });
  };
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
  const paymentQrInput = document.createElement('input');
  paymentQrInput.type = 'file'; paymentQrInput.accept = 'image/jpeg,image/png,image/webp'; paymentQrInput.hidden = true; paymentQrSlot.append(paymentQrInput);
  const paymentQrStorageKey = 'hgyak-payment-qr';
  const paymentQrChangesKey = 'hgyak-payment-qr-changes';
  let paymentQrUnlocked = false;
  const getPaymentQrChanges = () => { try { return JSON.parse(localStorage.getItem(paymentQrChangesKey) || '[]').filter(time => Date.now() - time < 86400000); } catch { return []; } };
  const canChangePaymentQr = () => true;
  const recordPaymentQrChange = () => { const changes = getPaymentQrChanges(); changes.push(Date.now()); localStorage.setItem(paymentQrChangesKey, JSON.stringify(changes)); };
  const renderPaymentQr = () => { const savedQr = localStorage.getItem(paymentQrStorageKey); paymentQrImage.hidden = !savedQr; paymentQrPlaceholder.hidden = Boolean(savedQr); if (savedQr) paymentQrImage.src = savedQr; paymentQrManage.textContent = paymentQrUnlocked ? (savedQr ? 'Replace payment QR' : 'Add payment QR') : 'Manage payment QR +'; paymentQrSlot.querySelector('.payment-qr-actions')?.remove(); if (!paymentQrUnlocked) return; const actions = document.createElement('div'); actions.className = 'payment-qr-actions'; const replace = document.createElement('button'); replace.className = 'button button-primary'; replace.type = 'button'; replace.textContent = savedQr ? 'Edit / replace' : 'Add QR'; replace.addEventListener('click', () => { if (!canChangePaymentQr()) { window.alert('Payment QR change limit reached. Try again after 24 hours.'); return; } paymentQrInput.click(); }); actions.append(replace); if (savedQr) { const remove = document.createElement('button'); remove.className = 'button button-outline'; remove.type = 'button'; remove.textContent = 'Remove QR'; remove.addEventListener('click', () => { if (!canChangePaymentQr()) { window.alert('Payment QR change limit reached. Try again after 24 hours.'); return; } localStorage.removeItem(paymentQrStorageKey); recordPaymentQrChange(); renderPaymentQr(); }); actions.append(remove); } paymentQrSlot.append(actions); };
  const unlockPaymentQr = () => { paymentQrUnlocked = true; closePasswordModal(); renderPaymentQr(); };
  paymentQrManage.addEventListener('click', () => { if (paymentQrUnlocked) { renderPaymentQr(); return; } pendingUploadAction = 'payment-qr'; passwordHeading.textContent = 'Manage payment QR'; passwordIntro.textContent = 'Enter the password to show add, edit and remove options.'; passwordModal.classList.add('open'); passwordModal.setAttribute('aria-hidden', 'false'); passwordInput.focus(); });
  paymentQrInput.addEventListener('change', () => { const file = paymentQrInput.files[0]; if (!file || !file.type.startsWith('image/')) { window.alert('Please choose a QR image.'); paymentQrInput.value = ''; return; } if (!canChangePaymentQr()) { window.alert('Payment QR change limit reached. Try again after 24 hours.'); paymentQrInput.value = ''; return; } const reader = new FileReader(); reader.addEventListener('load', () => { localStorage.setItem(paymentQrStorageKey, reader.result); recordPaymentQrChange(); renderPaymentQr(); paymentQrInput.value = ''; }); reader.readAsDataURL(file); });
  renderPaymentQr();

  const eventList = document.querySelector('.event-list');
  const eventHeading = document.querySelector('#events .section-heading');
  const eventStorageKey = 'hgyak-events-v1';
  const eventManageButton = document.createElement('button');
  eventManageButton.className = 'button button-primary event-manage-button';
  eventManageButton.type = 'button';
  eventManageButton.textContent = 'Manage events +';
  eventHeading.append(eventManageButton);
  let eventOptionsUnlocked = false;
  const eventModal = document.createElement('div');
  eventModal.className = 'event-modal';
  eventModal.setAttribute('aria-hidden', 'true');
  eventModal.innerHTML = '<form class="event-modal-form"><button class="event-modal-close" type="button" aria-label="Close">×</button><h3>Manage festival events</h3><p class="event-modal-intro">Update the schedule, or add another event day.</p><label>Password<input class="event-password" type="password" required autocomplete="off"></label><div class="event-fields"><label>Day<input class="event-day" type="text" required placeholder="14"></label><label>Month<input class="event-month" type="text" required placeholder="SEP"></label><label class="event-field-wide">Event title<input class="event-name" type="text" required></label><label>Label<input class="event-label" type="text" required placeholder="Community"></label><label class="event-field-wide">Description<textarea class="event-description" rows="3" required></textarea></label><label>Time<input class="event-time" type="text" required placeholder="7:30 PM"></label><label>Location<input class="event-location" type="text" required placeholder="Main Pandal"></label></div><p class="form-status error event-status" role="status"></p><div class="event-modal-actions"><button class="button button-outline event-unlock" type="button">Unlock edit options</button><button class="button button-outline event-cancel" type="button">Cancel</button><button class="button button-primary event-submit" type="submit">Add event</button></div></form></div>';
  document.body.append(eventModal);
  const eventForm = eventModal.querySelector('.event-modal-form');
  const eventPassword = eventModal.querySelector('.event-password');
  const eventFields = eventModal.querySelector('.event-fields');
  const eventDay = eventModal.querySelector('.event-day');
  const eventMonth = eventModal.querySelector('.event-month');
  const eventName = eventModal.querySelector('.event-name');
  const eventLabel = eventModal.querySelector('.event-label');
  const eventDescription = eventModal.querySelector('.event-description');
  const eventTime = eventModal.querySelector('.event-time');
  const eventLocation = eventModal.querySelector('.event-location');
  const eventStatus = eventModal.querySelector('.event-status');
  const eventSubmit = eventModal.querySelector('.event-submit');
  let eventAction = 'add';
  let editingEventId = null;
  const getEvents = () => { try { const events = JSON.parse(localStorage.getItem(eventStorageKey) || '[]'); return Array.isArray(events) ? events : []; } catch { return []; } };
  const saveEvents = events => localStorage.setItem(eventStorageKey, JSON.stringify(events));
  const initializeEvents = () => {
    if (localStorage.getItem(eventStorageKey)) return;
    const existingEvents = [...eventList.querySelectorAll('.event-row')].map((row, index) => ({ id: `original-${index}`, day: row.querySelector('.event-date b').textContent.trim(), month: row.querySelector('.event-date span').textContent.trim(), name: row.querySelector('.event-title h3').textContent.trim(), label: row.querySelector('.pill').textContent.trim(), description: row.querySelector('.event-info p').textContent.trim(), time: row.querySelector('.event-meta span').textContent.trim(), location: row.querySelector('.event-meta small').textContent.trim() }));
    saveEvents(existingEvents);
  };
  const closeEventModal = () => { eventModal.classList.remove('open'); eventModal.setAttribute('aria-hidden', 'true'); eventForm.reset(); eventStatus.textContent = ''; };
  const openEventModal = (action = 'add', eventData = null) => {
    eventAction = action;
    editingEventId = eventData ? eventData.id : null;
    eventDay.value = eventData ? eventData.day : '';
    eventMonth.value = eventData ? eventData.month : '';
    eventName.value = eventData ? eventData.name : '';
    eventLabel.value = eventData ? eventData.label : '';
    eventDescription.value = eventData ? eventData.description : '';
    eventTime.value = eventData ? eventData.time : '';
    eventLocation.value = eventData ? eventData.location : '';
    eventSubmit.textContent = action === 'add' ? 'Add event' : action === 'edit' ? 'Save changes' : 'Remove event';
    eventFields.hidden = action === 'remove';
    eventModal.classList.add('open');
    eventModal.setAttribute('aria-hidden', 'false');
    eventPassword.focus();
  };
  const renderEvents = () => {
    eventList.querySelectorAll('.event-row').forEach(row => row.remove());
    getEvents().forEach(eventData => {
      const row = document.createElement('article');
      row.className = 'event-row managed-event';
      row.innerHTML = `<div class="event-date"><b>${eventData.day}</b><span>${eventData.month}</span></div><div class="event-info"><div class="event-title"><h3></h3><span class="pill"></span></div><p></p></div><div class="event-meta"><span></span><small></small></div><span class="event-arrow">↗</span>`;
      row.querySelector('.event-title h3').textContent = eventData.name;
      row.querySelector('.pill').textContent = eventData.label;
      row.querySelector('.event-info p').textContent = eventData.description;
      row.querySelector('.event-meta span').textContent = eventData.time;
      row.querySelector('.event-meta small').textContent = eventData.location;
      if (eventOptionsUnlocked) {
        const actions = document.createElement('div');
        actions.className = 'event-actions';
        const edit = document.createElement('button');
        edit.className = 'event-action';
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => openEventModal('edit', eventData));
        const remove = document.createElement('button');
        remove.className = 'event-action event-remove';
        remove.type = 'button';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => openEventModal('remove', eventData));
        actions.append(edit, remove);
        row.append(actions);
      }
      eventList.append(row);
    });
  };
  eventManageButton.addEventListener('click', () => openEventModal());
  eventModal.querySelector('.event-unlock').addEventListener('click', () => {
    if (eventPassword.value !== uploadPassword) { eventStatus.textContent = 'Incorrect password.'; eventPassword.select(); return; }
    eventOptionsUnlocked = true;
    closeEventModal();
    renderEvents();
  });
  eventForm.addEventListener('submit', submitEvent => {
    submitEvent.preventDefault();
    if (eventPassword.value !== uploadPassword) { eventStatus.textContent = 'Incorrect password.'; eventPassword.select(); return; }
    const events = getEvents();
    if (eventAction === 'remove') saveEvents(events.filter(eventData => eventData.id !== editingEventId));
    else {
      const updatedEvent = { day: eventDay.value.trim(), month: eventMonth.value.trim().toUpperCase(), name: eventName.value.trim(), label: eventLabel.value.trim(), description: eventDescription.value.trim(), time: eventTime.value.trim(), location: eventLocation.value.trim() };
      if (eventAction === 'edit') { const eventData = events.find(item => item.id === editingEventId); if (eventData) Object.assign(eventData, updatedEvent); saveEvents(events); }
      else { events.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ...updatedEvent }); saveEvents(events); }
    }
    closeEventModal();
    renderEvents();
  });
  eventModal.querySelector('.event-modal-close').addEventListener('click', closeEventModal);
  eventModal.querySelector('.event-cancel').addEventListener('click', closeEventModal);
  eventModal.addEventListener('click', event => { if (event.target === eventModal) closeEventModal(); });
  initializeEvents();
  renderEvents();

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
  const storyMovieInput = document.createElement('input');
  storyMovieInput.type = 'file'; storyMovieInput.accept = 'video/mp4,video/webm,video/ogg'; storyMovieInput.hidden = true; document.querySelector('.story-movie').append(storyMovieInput);
  const storyMovieStorageKey = 'hgyak-story-movie';
  const renderStoryMovie = () => { const savedMovie = localStorage.getItem(storyMovieStorageKey); const movieSource = savedMovie || homeVideoSources[0]; storyMovie.hidden = false; storyMoviePlaceholder.hidden = true; storyMovie.src = movieSource; storyMovieManage.textContent = savedMovie ? 'Replace story movie' : 'Add story movie +'; };
  storyMovieManage.addEventListener('click', () => { pendingUploadAction = 'story-movie'; passwordHeading.textContent = 'Manage story movie'; passwordIntro.textContent = 'Enter the password to add or replace the story movie.'; passwordModal.classList.add('open'); passwordModal.setAttribute('aria-hidden', 'false'); passwordInput.focus(); });
  storyMovieInput.addEventListener('change', () => { const file = storyMovieInput.files[0]; if (!file || !file.type.startsWith('video/')) { window.alert('Please choose a video file.'); storyMovieInput.value = ''; return; } const reader = new FileReader(); reader.addEventListener('load', () => { try { localStorage.setItem(storyMovieStorageKey, reader.result); renderStoryMovie(); } catch { window.alert('This video is too large to save in this browser.'); } storyMovieInput.value = ''; }); reader.readAsDataURL(file); });
  renderStoryMovie();

  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  const sections = [...document.querySelectorAll('main section[id]')];
  const activeObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)); } }), { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(section => activeObserver.observe(section));
});

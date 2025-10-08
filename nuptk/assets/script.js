// DOM Elements
        const nuptkInput = document.getElementById('nuptk');
        const nameInput = document.getElementById('name');
        const birthDateInput = document.getElementById('birthDate');
        const birthPlaceInput = document.getElementById('birthPlace');
        const genderInput = document.getElementById('gender');
        const photoInput = document.getElementById('photo');
        const photoUpload = document.getElementById('photoUpload');
        const uploadText = document.getElementById('uploadText');
        const fileInfo = document.getElementById('fileInfo');
        const previewBtn = document.getElementById('previewBtn');
        const clearBtn = document.getElementById('clearBtn');
        const cardPreview = document.getElementById('cardPreview');
        const cardBackPreview = document.getElementById('cardBackPreview');
        const canvas = document.getElementById('canvas');
        
        // Card preview elements
        const cardNuptk = document.getElementById('cardNuptk');
        const cardNama = document.getElementById('cardNama');
        const cardTgl = document.getElementById('cardTgl');
        const cardTl = document.getElementById('cardTl');
        const cardJk = document.getElementById('cardJk');
        const cardPhoto = document.getElementById('cardPhoto');

        // Validation elements
        const nuptkValidation = document.getElementById('nuptkValidation');
        const nameValidation = document.getElementById('nameValidation');
        const birthDateValidation = document.getElementById('birthDateValidation');
        const birthPlaceValidation = document.getElementById('birthPlaceValidation');
        const genderValidation = document.getElementById('genderValidation');

        // Variables
        let currentPhotoFile = null;
        let qrCodeDataURL = '';

        // Array nama bulan dalam bahasa Indonesia
        const namaBulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        // Format date to dd month_name yyyy (e.g., 15 Januari 1990)
        function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const monthIndex = date.getMonth();
            const year = date.getFullYear();
            
            // Gunakan nama bulan dari array
            const monthName = namaBulan[monthIndex];
            
            return `${day} ${monthName} ${year}`;
        }

        // Adjust font size based on text length
        function adjustFontSize(element, text) {
            // Reset classes
            element.classList.remove('long-text', 'very-long-text');
            
            // Apply appropriate class based on text length
            if (text.length > 27) {
                element.classList.add('very-long-text');
            } else if (text.length > 24) {
                element.classList.add('long-text');
            }
        }

        // Validate form fields
        function validateField(field, validationElement, fieldName, minLength = 0, maxLength = null, isNumeric = false) {
            const value = field.value.trim();
            let isValid = true;
            let message = '';
            
            if (!value) {
                isValid = false;
                message = `${fieldName} harus diisi`;
            } else if (minLength && value.length < minLength) {
                isValid = false;
                message = `${fieldName} minimal ${minLength} karakter`;
            } else if (maxLength && value.length > maxLength) {
                isValid = false;
                message = `${fieldName} maksimal ${maxLength} karakter`;
            } else if (isNumeric && !/^\d+$/.test(value)) {
                isValid = false;
                message = `${fieldName} harus berupa angka`;
            }
            
            if (isValid) {
                validationElement.textContent = '';
                validationElement.className = 'validation-message';
                validationElement.style.display = 'none';
            } else {
                validationElement.textContent = message;
                validationElement.className = 'validation-message validation-error';
                validationElement.style.display = 'block';
            }
            
            return isValid;
        }

        // Only allow numbers in NUPTK field
        nuptkInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            validateField(nuptkInput, nuptkValidation, 'NUPTK', 16, 16, true);
            generateCard();
        });

        // Event Listeners untuk auto-generate
        nameInput.addEventListener('input', function() {
            validateField(nameInput, nameValidation, 'Nama', 3, 28);
            generateCard();
        });
        
        birthDateInput.addEventListener('input', function() {
            validateField(birthDateInput, birthDateValidation, 'Tanggal Lahir');
            generateCard();
        });
        
        birthPlaceInput.addEventListener('input', function() {
            validateField(birthPlaceInput, birthPlaceValidation, 'Tempat Lahir', 3, 28);
            generateCard();
        });
        
        genderInput.addEventListener('change', function() {
            validateField(genderInput, genderValidation, 'Jenis Kelamin');
            generateCard();
        });
        
        // Photo upload handling
        photoUpload.addEventListener('click', () => {
            photoInput.click();
        });
        
        // Drag and drop functionality for photo upload
        photoUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoUpload.classList.add('dragover');
        });
        
        photoUpload.addEventListener('dragleave', () => {
            photoUpload.classList.remove('dragover');
        });
        
        photoUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            photoUpload.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                photoInput.files = e.dataTransfer.files;
                handlePhotoFile(e.dataTransfer.files[0]);
            }
        });
        
        photoInput.addEventListener('change', function(e) {
            if (e.target.files[0]) {
                handlePhotoFile(e.target.files[0]);
            }
        });
        
        function handlePhotoFile(file) {
            // Check file size (max 300KB)
            if (file.size > 300 * 1024) {
                fileInfo.innerHTML = '<div class="file-error">Ukuran file terlalu besar! Maksimal 300KB</div>';
                currentPhotoFile = null;
                updatePreviewButton();
                return;
            }
            
            // Check file format (only jpg, jpeg, png)
            const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedFormats.includes(file.type)) {
                fileInfo.innerHTML = '<div class="file-error">Format file tidak didukung! Hanya .jpg, .jpeg, .png yang diperbolehkan</div>';
                currentPhotoFile = null;
                updatePreviewButton();
                return;
            }
            
            currentPhotoFile = file;
            uploadText.textContent = file.name;
            fileInfo.innerHTML = '<div class="file-info">Foto berhasil diunggah</div>';
            
            const reader = new FileReader();
            reader.onload = function(e) {
                cardPhoto.src = e.target.result;
                // Hapus background image ketika foto diupload
                cardPhoto.style.backgroundImage = 'none';
                generateCard();
            }
            reader.readAsDataURL(file);
        }
        
        previewBtn.addEventListener('click', openPreview);
        clearBtn.addEventListener('click', clearData);
        
        // Update preview button state
        function updatePreviewButton() {
            const isNuptkValid = validateField(nuptkInput, nuptkValidation, 'NUPTK', 16, 16, true);
            const isNameValid = validateField(nameInput, nameValidation, 'Nama', 3, 28);
            const isBirthDateValid = validateField(birthDateInput, birthDateValidation, 'Tanggal Lahir');
            const isBirthPlaceValid = validateField(birthPlaceInput, birthPlaceValidation, 'Tempat Lahir', 3, 28);
            const isGenderValid = validateField(genderInput, genderValidation, 'Jenis Kelamin');
            
            const allDataFilled = isNuptkValid && 
                                 isNameValid && 
                                 isBirthDateValid && 
                                 isBirthPlaceValid && 
                                 isGenderValid && 
                                 currentPhotoFile;
            
            previewBtn.disabled = !allDataFilled;
        }
        
        // Functions
        function generateCard() {
            // Update card preview
            const nuptkValue = nuptkInput.value || '16 digit';
            const namaValue = nameInput.value || 'Nama Lengkap';
            
            cardNuptk.textContent = nuptkValue;
            cardNuptk.classList.toggle('empty-state', !nuptkInput.value);
            adjustFontSize(cardNuptk, nuptkValue);
            
            cardNama.textContent = namaValue;
            cardNama.classList.toggle('empty-state', !nameInput.value);
            adjustFontSize(cardNama, namaValue);
            
            // Format birth date to dd month_name yyyy
            const birthDateFormatted = formatDate(birthDateInput.value);
            const birthPlace = birthPlaceInput.value || 'Tempat Lahir';
            const birthDate = birthDateFormatted || 'Tanggal Lahir';
            const tglValue = `${birthDate}`;
            const tlValue = `${birthPlace}`;
            
            cardTgl.textContent = tglValue;
            cardTl.textContent = tlValue;
            cardTgl.classList.toggle('empty-state', !birthDateInput.value);
            cardTl.classList.toggle('empty-state', !birthPlaceInput.value);
            adjustFontSize(cardTgl, tglValue);
            adjustFontSize(cardTl, tlValue);
            
            const jkValue = genderInput.value || 'Jenis Kelamin';
            cardJk.textContent = jkValue;
            cardJk.classList.toggle('empty-state', !genderInput.value);
            adjustFontSize(cardJk, jkValue);
            
            // Generate QR Code if we have NUPTK and Nama
            if (nuptkInput.value && nameInput.value) {
                generateQRCode();
            } else {
                canvas.style.display = 'none';
            }
            
            updatePreviewButton();
        }
        
        function generateQRCode() {
            // Create QR code data - hanya NUPTK dan Nama
            const qrData = `NUPTK: ${nuptkInput.value}\nNama: ${nameInput.value}`;
            
            // Generate QR code using the provided library
            QRCode.toCanvas(canvas, qrData, function(error) {
                if (error) {
                    console.error('QR Code error:', error);
                    canvas.style.display = 'none';
                } else {
                    canvas.style.display = 'block';
                }
            });
        }
        
        function openPreview() {
            // Kumpulkan data
            const cardData = {
                nuptk: nuptkInput.value,
                nama: nameInput.value,
                tglLahir: birthDateInput.value,
                tempatLahir: birthPlaceInput.value,
                jk: genderInput.value,
                photo: cardPhoto.src
            };
            
            // Coba gunakan localStorage terlebih dahulu
            try {
                localStorage.setItem('nuptkCardData', JSON.stringify(cardData));
            } catch (e) {
                console.log('LocalStorage tidak tersedia, menggunakan URL parameters');
            }
            
            // Juga siapkan URL parameters sebagai fallback
            const params = new URLSearchParams();
            params.append('nuptk', cardData.nuptk);
            params.append('nama', cardData.nama);
            params.append('tglLahir', cardData.tglLahir);
            params.append('tempatLahir', cardData.tempatLahir);
            params.append('jk', cardData.jk);
            
            // Untuk foto, gunakan URL parameters hanya jika tidak terlalu panjang
            if (cardData.photo && cardData.photo.length < 1500) {
                params.append('photo', cardData.photo);
            }
            
            const previewUrl = `https://qillasoft.blogspot.com/p/preview-kartu-nuptk.html?${params.toString()}`;
            
            window.open(previewUrl, '_blank');
        }
        
        function clearData() {
            // Clear all form inputs
            nuptkInput.value = '';
            nameInput.value = '';
            birthDateInput.value = '';
            birthPlaceInput.value = '';
            genderInput.value = '';
            photoInput.value = '';
            
            // Clear photo dan kembalikan background image
            cardPhoto.src = '';
            cardPhoto.style.backgroundImage = 'url("https://cdn.jsdelivr.net/gh/qillasoft/card@master/img/etc_foto_70x105px.jpg")';
            currentPhotoFile = null;
            uploadText.textContent = 'Klik atau seret file ke sini untuk mengunggah foto';
            fileInfo.innerHTML = '';
            
            // Clear QR code
            canvas.style.display = 'none';
            qrCodeDataURL = '';
            
            // Reset card preview to default
            cardNuptk.textContent = '16 digit';
            cardNuptk.classList.add('empty-state');
            cardNama.textContent = 'Nama Lengkap';
            cardNama.classList.add('empty-state');
            cardTl.textContent = 'Tempat Lahir';
            cardTl.classList.add('empty-state');
            cardTgl.textContent = 'Tanggal Lahir';
            cardTgl.classList.add('empty-state');
            cardJk.textContent = 'Jenis Kelamin';
            cardJk.classList.add('empty-state');
            
            // Reset font sizes
            cardNuptk.classList.remove('long-text', 'very-long-text');
            cardNama.classList.remove('long-text', 'very-long-text');
            cardTl.classList.remove('long-text', 'very-long-text');
            cardTgl.classList.remove('long-text', 'very-long-text');
            cardJk.classList.remove('long-text', 'very-long-text');
            
            // Hide validation messages
            const validationMessages = document.querySelectorAll('.validation-message');
            validationMessages.forEach(msg => {
                msg.style.display = 'none';
            });
            
            // Disable preview button
            previewBtn.disabled = true;
        }
        
        // Initialize with empty state
        window.addEventListener('load', function() {
            clearData();
        });

// URL background dari halaman utama
        const BACKGROUND_FRONT = 'img/nuptk_front.jpg';
        const BACKGROUND_BACK = 'img/nuptk_back.jpg';
        const DEFAULT_PHOTO_BG = 'img/etc_foto_70x105px.jpg';

        // Fungsi untuk mengambil data dari URL parameter
        function getUrlParams() {
            const params = new URLSearchParams(window.location.search);
            return {
                nuptk: params.get('nuptk') || '',
                nama: params.get('nama') || '',
                tglLahir: params.get('tglLahir') || '',
                tempatLahir: params.get('tempatLahir') || '',
                jk: params.get('jk') || '',
                photo: params.get('photo') || ''
            };
        }
        
        // Format tanggal
        function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const monthIndex = date.getMonth();
            const year = date.getFullYear();
            
            const namaBulan = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            
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
        
        // Generate QR Code
        function generateQRCode(nuptk, nama) {
            if (!nuptk || !nama) return;
            
            const qrData = `NUPTK: ${nuptk}\nNama: ${nama}`;
            const canvas = document.getElementById('previewCanvas');
            
            // Pastikan library QRCode tersedia
            if (typeof QRCode !== 'undefined') {
                QRCode.toCanvas(canvas, qrData, function(error) {
                    if (error) {
                        console.error('QR Code error:', error);
                        canvas.style.display = 'none';
                    } else {
                        canvas.style.display = 'block';
                    }
                });
            }
        }
        
        // Set background images
        function setBackgroundImages() {
            const cardFront = document.getElementById('previewCardFront');
            const cardBack = document.getElementById('previewCardBack');
            const cardPhoto = document.getElementById('previewPhoto');
            
            // Set background kartu depan
            cardFront.style.backgroundImage = `url('${BACKGROUND_FRONT}')`;
            
            // Set background kartu belakang
            cardBack.style.backgroundImage = `url('${BACKGROUND_BACK}')`;
            
            // Set background default untuk foto
            cardPhoto.style.backgroundImage = `url('${DEFAULT_PHOTO_BG}')`;
        }

        // Fungsi untuk memastikan background tercetak
        function ensurePrintBackgrounds() {
            // Force set background images sebelum print
            const cardFront = document.getElementById('previewCardFront');
            const cardBack = document.getElementById('previewCardBack');
            const cardPhoto = document.getElementById('previewPhoto');
            
            cardFront.style.backgroundImage = `url('${BACKGROUND_FRONT}')`;
            cardBack.style.backgroundImage = `url('${BACKGROUND_BACK}')`;
            
            // Jika tidak ada foto yang diupload, set background default
            if (!cardPhoto.src || cardPhoto.src === window.location.href) {
                cardPhoto.style.backgroundImage = `url('${DEFAULT_PHOTO_BG}')`;
            }
        }

        // Fungsi print khusus
        function printKartu() {
            // Tambahkan delay kecil untuk memastikan semua elemen siap
            setTimeout(function() {
                ensurePrintBackgrounds();
                window.print();
            }, 100);
        }
        
        // Load data saat halaman dimuat
        window.addEventListener('load', function() {
            // Set background images terlebih dahulu
            setBackgroundImages();
            
            let cardData = null;
            
            // Coba ambil dari localStorage terlebih dahulu
            try {
                const storedData = localStorage.getItem('nuptkCardData');
                if (storedData) {
                    cardData = JSON.parse(storedData);
                    // Hapus data dari localStorage setelah digunakan
                    localStorage.removeItem('nuptkCardData');
                }
            } catch (e) {
                console.log('Tidak bisa mengakses localStorage');
            }
            
            // Jika tidak ada di localStorage, coba dari URL parameters
            if (!cardData) {
                cardData = getUrlParams();
            }
            
            // Update data kartu jika ada data
            if (cardData && (cardData.nuptk || cardData.nama)) {
                document.getElementById('previewNuptk').textContent = cardData.nuptk || '16 digit';
                document.getElementById('previewNama').textContent = cardData.nama || 'Nama Lengkap';
                document.getElementById('previewTgl').textContent = formatDate(cardData.tglLahir) || 'Tanggal Lahir';
                document.getElementById('previewTl').textContent = cardData.tempatLahir || 'Tempat Lahir';
                document.getElementById('previewJk').textContent = cardData.jk || 'Jenis Kelamin';
                
                // Hapus kelas empty-state jika ada data
                if (cardData.nuptk) document.getElementById('previewNuptk').classList.remove('empty-state');
                if (cardData.nama) document.getElementById('previewNama').classList.remove('empty-state');
                if (cardData.tglLahir) document.getElementById('previewTgl').classList.remove('empty-state');
                if (cardData.tempatLahir) document.getElementById('previewTl').classList.remove('empty-state');
                if (cardData.jk) document.getElementById('previewJk').classList.remove('empty-state');
                
                // Adjust font sizes
                adjustFontSize(document.getElementById('previewNuptk'), cardData.nuptk);
                adjustFontSize(document.getElementById('previewNama'), cardData.nama);
                adjustFontSize(document.getElementById('previewTgl'), formatDate(cardData.tglLahir));
                adjustFontSize(document.getElementById('previewTl'), cardData.tempatLahir);
                adjustFontSize(document.getElementById('previewJk'), cardData.jk);
                
                // Set photo jika ada
                if (cardData.photo) {
                    document.getElementById('previewPhoto').src = cardData.photo;
                    // Hapus background image default
                    document.getElementById('previewPhoto').style.backgroundImage = 'none';
                }
                
                // Generate QR Code
                generateQRCode(cardData.nuptk, cardData.nama);
            } else {
                // Jika tidak ada data, tampilkan pesan
                alert('Tidak ada data kartu yang ditemukan. Silakan kembali ke halaman utama dan klik "Preview Kartu" lagi.');
            }

            // Tambahkan event listener untuk sebelum print
            window.addEventListener('beforeprint', ensurePrintBackgrounds);
        });

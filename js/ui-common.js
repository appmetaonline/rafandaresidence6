// js/ui-common.js - Toast Notifikasi, Modal Dialog Sukses & Konfirmasi Global

function showToastNotification(message, type = 'info') {
    const toast = document.getElementById('simakToast');
    const card = document.getElementById('simakToastCard');
    const icon = document.getElementById('simakToastIcon');
    const text = document.getElementById('simakToastText');
    if (!toast || !card || !icon || !text) return;

    text.textContent = message;

    if (type === 'success') {
        icon.className = 'fa-solid fa-circle-check text-emerald-400 text-base flex-shrink-0';
        card.className = 'bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center space-x-3';
    } else if (type === 'error') {
        icon.className = 'fa-solid fa-circle-exclamation text-rose-400 text-base flex-shrink-0';
        card.className = 'bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-rose-500/50 flex items-center space-x-3';
    } else if (type === 'warning') {
        icon.className = 'fa-solid fa-triangle-exclamation text-amber-400 text-base flex-shrink-0';
        card.className = 'bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-amber-500/50 flex items-center space-x-3';
    } else {
        icon.className = 'fa-solid fa-circle-info text-sky-400 text-base flex-shrink-0';
        card.className = 'bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center space-x-3';
    }

    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-24', 'opacity-0');
    }, 3500);
}

// ==========================================
// POP-UP DIALOG KONFIRMASI GLOBAL (SIMPAN, EDIT, HAPUS)
// ==========================================
let activeConfirmCallback = null;

function showConfirmationModal({
    title = 'Konfirmasi Tindakan',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    type = 'primary', // 'primary' | 'success' | 'danger' | 'warning'
    icon = null,
    onConfirm = null
}) {
    const modal = document.getElementById('modalConfirm');
    const titleElem = document.getElementById('confirmModalTitle');
    const msgElem = document.getElementById('confirmModalMessage');
    const iconWrapper = document.getElementById('confirmModalIconWrapper');
    const iconElem = document.getElementById('confirmModalIcon');
    const cancelBtn = document.getElementById('confirmModalCancelBtn');
    const confirmBtn = document.getElementById('confirmModalConfirmBtn');
    const confirmTextElem = document.getElementById('confirmModalConfirmText');

    if (!modal) return;

    activeConfirmCallback = onConfirm;

    if (titleElem) titleElem.textContent = title;
    if (msgElem) msgElem.textContent = message;
    if (cancelBtn) cancelBtn.textContent = cancelText;
    if (confirmTextElem) confirmTextElem.textContent = confirmText;

    let iconClass = icon;
    if (!iconClass) {
        if (type === 'danger') iconClass = 'fa-solid fa-trash-can';
        else if (type === 'success') iconClass = 'fa-solid fa-floppy-disk';
        else if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';
        else iconClass = 'fa-solid fa-pen-to-square';
    }
    if (iconElem) iconElem.className = iconClass + ' text-lg';

    if (type === 'danger') {
        if (iconWrapper) iconWrapper.className = 'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-50 text-rose-600 ring-4 ring-rose-50/60';
        if (confirmBtn) confirmBtn.className = 'px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all flex items-center space-x-1.5 cursor-pointer';
    } else if (type === 'success') {
        if (iconWrapper) iconWrapper.className = 'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/60';
        if (confirmBtn) confirmBtn.className = 'px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5 cursor-pointer';
    } else if (type === 'warning') {
        if (iconWrapper) iconWrapper.className = 'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50 text-amber-600 ring-4 ring-amber-50/60';
        if (confirmBtn) confirmBtn.className = 'px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all flex items-center space-x-1.5 cursor-pointer';
    } else {
        if (iconWrapper) iconWrapper.className = 'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/60';
        if (confirmBtn) confirmBtn.className = 'px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5 cursor-pointer';
    }

    modal.classList.remove('hidden');
}

function closeConfirmModal() {
    const modal = document.getElementById('modalConfirm');
    if (modal) modal.classList.add('hidden');
    activeConfirmCallback = null;
}

function executeConfirmAction() {
    const callback = activeConfirmCallback;
    closeConfirmModal();
    if (typeof callback === 'function') {
        callback();
    }
}

// ==========================================
// POP-UP DIALOG SUKSES SIMPAN & EDIT
// ==========================================
let successModalTimer = null;

function showSuccessModal(message = 'data berhasil disimpan') {
    const modal = document.getElementById('modalSuccess');
    const msgElem = document.getElementById('successModalMessage');
    if (msgElem) msgElem.textContent = message;
    if (modal) modal.classList.remove('hidden');

    // Tampilkan juga toast notifikasi sebagai feedback instan
    showToastNotification(message, 'success');

    // Auto tutup setelah 3 detik jika tidak diklik
    if (successModalTimer) clearTimeout(successModalTimer);
    successModalTimer = setTimeout(() => {
        closeSuccessModal();
    }, 3000);
}

function closeSuccessModal() {
    if (successModalTimer) {
        clearTimeout(successModalTimer);
        successModalTimer = null;
    }
    const modal = document.getElementById('modalSuccess');
    if (modal) modal.classList.add('hidden');
}

// Global Event listener untuk modal (Escape, Click backdrop)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
        const modalSuccess = document.getElementById('modalSuccess');
        if (modalSuccess && !modalSuccess.classList.contains('hidden')) {
            closeSuccessModal();
            return;
        }
        const modal = document.getElementById('modalConfirm');
        if (modal && !modal.classList.contains('hidden')) {
            closeConfirmModal();
        }
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalConfirm');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeConfirmModal();
            }
        });
    }
    const modalSuccess = document.getElementById('modalSuccess');
    if (modalSuccess) {
        modalSuccess.addEventListener('click', (e) => {
            if (e.target === modalSuccess) {
                closeSuccessModal();
            }
        });
    }
});

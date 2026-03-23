// Helper functions
const scrollToId = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
};

const openModal = (roomId, roomName) => {
    document.getElementById('modal-room-id').value = roomId;
    document.getElementById('modal-room-name').innerText = roomName;
    document.getElementById('booking-modal').style.display = 'flex';
};

const closeModal = () => {
    document.getElementById('booking-modal').style.display = 'none';
};

// Fetch and load rooms
async function loadRooms() {
    const container = document.getElementById('rooms-container');
    try {
        // Try the live API first
        const response = await fetch('/api/rooms');
        if (!response.ok) throw new Error('API unavailable');
        const rooms = await response.json();
        renderRooms(rooms);
    } catch (err) {
        // Fallback for static hosts (GitHub Pages)
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            renderRooms(data.rooms);
        } catch (fallbackErr) {
            container.innerHTML = `<p>Error loading rooms. Please check your connection.</p>`;
        }
    }
}

function renderRooms(rooms) {
    const container = document.getElementById('rooms-container');
    container.innerHTML = rooms.map(room => `
        <div class="card glass">
            <img src="${room.image}" alt="${room.type}">
            <div class="card-content">
                <h3>${room.type}</h3>
                <p>${room.description}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem;">
                    <span class="price">$${room.price}/night</span>
                    <button class="btn-small btn" onclick="openModal('${room.id}', '${room.type}')" ${room.status !== 'Available' ? 'disabled' : ''}>
                        ${room.status === 'Available' ? 'Book Now' : 'Occupied'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Fetch and load menu
async function loadMenu() {
    const container = document.getElementById('menu-container');
    try {
        const response = await fetch('/api/menu');
        if (!response.ok) throw new Error('API unavailable');
        const menu = await response.json();
        renderMenu(menu);
    } catch (err) {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            renderMenu(data.menu);
        } catch (fallbackErr) {
            container.innerHTML = `<p>Error loading menu.</p>`;
        }
    }
}

function renderMenu(menu) {
    const container = document.getElementById('menu-container');
    container.innerHTML = menu.map(item => `
        <div class="card glass" style="display:flex; padding: 1rem; gap:1.5rem; align-items:center;">
            <img src="${item.image}" alt="${item.name}" style="width:100px; height:100px; border-radius:10px;">
            <div style="flex:1;">
                <h3>${item.name}</h3>
                <p style="font-size:0.9rem; color:var(--text-muted);">${item.description}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                    <span style="color:var(--gold); font-weight:700;">$${item.price}</span>
                    <button class="btn-small btn" onclick="alert('Order placed for ${item.name}!')" style="padding: 5px 12px; font-size: 0.8rem;">Order Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle Booking Form
document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const guestName = e.target[1].value.trim();
    const email = e.target[2].value;
    const date = e.target[3].value;
    const guests = e.target[4].value;

    if (!guestName) {
        alert('Please enter your name.');
        return;
    }

    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (bookingDate < today) {
        alert('Cannot book for a past date.');
        return;
    }

    if (bookingDate.getFullYear() > 2030) {
        alert('Please select a valid date.');
        return;
    }

    const formData = {
        roomId: document.getElementById('modal-room-id').value,
        guestName,
        email,
        date,
        guests
    };

    try {
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
            alert('Booking Confirmed! System ID: ' + result.reservation.id);
            closeModal();
            loadRooms(); // Refresh room status
        }
    } catch (err) {
        alert('Booking failed. Please try again.');
    }
});

// Initialize
window.onload = () => {
    loadRooms();
    loadMenu();
};

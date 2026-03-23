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
    let url = '/api/rooms';
    
    // Fallback for static hosts like GitHub Pages
    if (window.location.hostname.includes('github.io')) url = 'data.json';

    try {
        const response = await fetch(url);
        let data = await response.json();
        const rooms = url === 'data.json' ? data.rooms : data;
        
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
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p>Error loading rooms. Please check if the server is running.</p>`;
    }
}

// Fetch and load menu
async function loadMenu() {
    const container = document.getElementById('menu-container');
    let url = '/api/menu';

    if (window.location.hostname.includes('github.io')) url = 'data.json';

    try {
        const response = await fetch(url);
        let data = await response.json();
        const menu = url === 'data.json' ? data.menu : data;
        
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
    } catch (err) {
        container.innerHTML = `<p>Error loading menu.</p>`;
    }
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

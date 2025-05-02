const loginButton = document.getElementById("loginForm");

loginButton.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const text = await response.text();
        const result = text ? JSON.parse(text) : {};

        if (response.ok) {
            alert(result.message);
            window.location.href = '/memberspage';
        } else {
            alert(result.error || 'Something went wrong. Please try again.');
        }        
    } catch (error) {
        alert('Network error. Please try again.');
        console.error(error);
    }
});
const logoutButton = document.getElementById("logoutButton");
const memberName = document.getElementById("memberName");
const randomImage = document.getElementById("randomImage");

// async function getUsername() {
//     const response = await fetch('/getUsername', {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     });

//     const text = await response.text();
//     const result = text ? JSON.parse(text) : {};

//     if (response.ok) {
//         memberName.innerText = result.username;
//     } else {
//         window.location.href = "/loginpage";
//     }
// };

// getUsername();

logoutButton.addEventListener("click", async () => {
    await fetch("/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    window.location.href = "/loginpage";
});

function setRandomImage() {
    const images = [
        "/image/catsideeye.jpg",
        "/image/dogsideeye.jpg",
        "/image/monkeysideeye.jpg"
    ];

    const randomIndex = Math.floor(Math.random() * images.length);
    randomImage.src = images[randomIndex];

    randomImage.width = 300;  
    randomImage.height = 300;
}

setRandomImage();
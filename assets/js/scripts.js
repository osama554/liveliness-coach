function showShimmer() {
    document.querySelectorAll('h2.content, img.content, p.content').forEach(element => {
        element.classList.add('shimmer-effect');
    });
}

function hideShimmer() {
    document.querySelectorAll('h2.content, img.content, p.content').forEach(element => {
        element.classList.remove('shimmer-effect');
    });
}

function formatRelativeDate(dateString) {
    const now = new Date();
    const reviewDate = new Date(dateString);
    const diffInTime = now.getTime() - reviewDate.getTime();
    const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

    if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
        return `${Math.floor(diffInDays / 7)} weeks ago`;
    } else {
        return `${Math.floor(diffInDays / 30)} months ago`;
    }
}

function updateSocialMediaLinks(data) {
    const links = {
        "instagram": document.getElementById('instagramLink'),
        "tikTok": document.getElementById('tiktokLink'),
        "youTube": document.getElementById('youtubeLink'),
        "website": document.getElementById('websiteLink')
    };

    for (const [key, value] of Object.entries(data)) {
        if (value) {
            links[key]?.setAttribute('href', value);
        } else {
            links[key]?.setAttribute('href', '#');
        }
    }
}

function updateNationality(data) {
    const nationality = data.nationality || "Unknown";
    const nationalityCode = data.nationalityCode.toLowerCase();

    const flagImageUrl = `https://flagcdn.com/w80/${nationalityCode}.png`;

    document.querySelector('#userNationality').innerHTML += ` ${nationality}`;
    document.querySelector('#userNationality span').textContent = 'Nationality:';
    document.getElementById('countryFlag').src = flagImageUrl;
    document.getElementById('countryFlag').alt = nationality;
}

function displayUserData(userData, totalEvents) {

    const socialLinks = {
        "instagram": userData.instagram,
        "tikTok": userData.tikTok,
        "website": userData.website,
        "youTube": userData.youTube
    };

    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userProfileImage').src = userData.mainProfilePhoto;
    document.getElementById('userBio').textContent = userData.bio;
    if (userData.reviewCount === 1) {
        document.getElementById('userTotalReviews').textContent = `${userData.reviewCount} review`;
    } else {
        document.getElementById('userTotalReviews').textContent = `${userData.reviewCount} reviews`;
    }
    document.getElementById('userTotalEvents').textContent = totalEvents;
    if (totalEvents === 1) {
        document.getElementById('userEvents').textContent = 'event';
    } else {
        document.getElementById('userEvents').textContent = 'events';
    }
    document.getElementById('userLocation').textContent = userData.locationString;
    updateSocialMediaLinks(socialLinks);
    updateNationality(userData);
}

function displayEvents(events) {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '';
    const firstFourEvents = events.slice(0, 4);

    firstFourEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        const date = new Date(event.trainingStartDateTime);
        const formattedDateParts = {
            weekday: date.toLocaleString("en-US", { weekday: "short" }),
            month: date.toLocaleString("en-US", { month: "long" }),
            day: date.toLocaleString("en-US", { day: "numeric" }),
            time: date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        };
        const formattedDate = `${formattedDateParts.weekday}, ${formattedDateParts.day} ${formattedDateParts.month} at ${formattedDateParts.time}`;

        eventCard.innerHTML = `
            <img class="event-photo" src="${event.coverPhotoUrl}" alt="${event.title}">
            <div class="event-card-content">
                <h2>${formattedDate}</h2>
                <h1>${event.title}</h1>
                <p>${event.trainingLocationString}</p>
            </div>
            <a href="${event.link}"><img src="./assets/images/plus.svg" alt="More"></a>
        `;

        container.appendChild(eventCard);
    });
}

function initializeSwiper(selector) {
    new Swiper(selector, {
        slidesPerView: 'auto',
        spaceBetween: 10
    });
}

function displayReviews(reviews) {
    const reviewsContainer = document.getElementById('reviews-carousel');
    reviewsContainer.innerHTML = '';

    reviews.forEach(review => {
        const reviewSlide = document.createElement('div');
        reviewSlide.className = 'swiper-slide';

        const formattedDate = formatRelativeDate(review.createdAt);

        reviewSlide.innerHTML = `
            <p>${review.review}</p>
            <div class="host-reviews-info">
                <div class="host-circle">
                    <img src="${review.reviewer.mainProfilePhoto}" alt="Reviewer">
                </div>
                <div class="host-reviews">
                    <h2>${review.reviewer.name}</h2>
                    <p>${formattedDate}</p>
                </div>
            </div>
        `;

        reviewsContainer.appendChild(reviewSlide);
    });

    initializeSwiper('.mySwiper');
}

function displayClubs(clubs) {
    const clubsContainer = document.getElementById('clubs-carousel');
    clubsContainer.innerHTML = '';

    clubs.forEach(club => {
        const clubSlide = document.createElement('a');
        clubSlide.className = 'club-card swiper-slide';
        clubSlide.href = club.link;

        clubSlide.innerHTML = `
            <img src="${club.headerPhoto}" alt="">
            <span>${club.category}</span>
            <div class="club-text">
                <h2>${club.name}</h2>
                <p>${club.bio}</p>
            </div>
        `;

        clubsContainer.appendChild(clubSlide);
    });

    initializeSwiper('.mySwiper-club');
}

function updateUi(userData, userEvents, userReviews) {
    console.log(userData, userEvents, userReviews);
    const userTotalEvents = userEvents.data.length;
    // UserData
    displayUserData(userData.user, userTotalEvents);

    // UserEvents
    displayEvents(userEvents.data);

    // UserReviews
    displayReviews(userReviews.data);

    // Userclubs
    displayClubs(userData.clubs);

}

async function makeApiRequest(url) {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const userId = urlParams.get("userId");

const userDataUrl = `https://prod-ts-liveliness-server.onrender.com/api/user/bundled/${userId}`;
const userEventsUrl = `https://prod-ts-liveliness-server.onrender.com/api/event/admin/${userId}`;
const userReviewsUrl = `https://prod-ts-liveliness-server.onrender.com/api/reviews/getAll/${userId}`;

showShimmer();

Promise.all([
    makeApiRequest(userDataUrl),
    makeApiRequest(userEventsUrl),
    makeApiRequest(userReviewsUrl)
])
    .then(([userData, userEvents, userReviews]) => {
        updateUi(userData, userEvents, userReviews);
        hideShimmer();
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        hideShimmer();
    });

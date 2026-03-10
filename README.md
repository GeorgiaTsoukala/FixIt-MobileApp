# FixIt

**FixIt** is a cross-platform mobile application built with **React Native** and **Firebase** designed to bridge the gap between home service professionals (handymen, plumbers, electricians, etc.) and customers.
The app serves as a real-time ecosystem where users can discover, hire and review reliable local professionals based on their specific needs and location.

## Features

### For Customers
* **Service Discovery:** Search for professionals by category (e.g., plumbing, painting, cleaning) and specific geographic areas.
* **Map Integration:** View available workers in your vicinity directly on an interactive map.
* **Informed Hiring:** Access professional profiles that include ratings and feedback from previous clients to ensure quality of service.
* **Transaction Management:** Hire professionals directly through the app and receive push notifications for job updates.
* **Reviews & Ratings:** Leave detailed feedback and star ratings after a service is completed.

### For Professionals
* **Business Exposure:** Create a professional profile to reach a wider audience and showcase services.
* **Reputation Building:** Use positive client reviews as references to grow a professional reputation.
* **Real-time Notifications:** Get instantly notified of new hire requests via push notifications.

## Tech Stack & Tools

The application follows a **Backend-as-a-Service (BaaS)** architecture, ensuring high performance and real-time data synchronization.

### Front-end
* **React Native:** An open-source framework used to build native mobile interfaces for both iOS and Android from a single JavaScript codebase.
* **Expo SDK:** Utilized to simplify access to native device features like the camera, GPS and push notifications.
* **React Native Maps:** Integrated with **Google Maps API** for location auto-complete and map-based service discovery.
* **Expo Notifications (Client):** Used to request user permissions, generate unique push tokens and handle incoming alerts.

### Back-end 
* **Firebase Authentication:** Handles secure user registration and login via email and password.
* **Cloud Firestore:** A NoSQL cloud database used to store and sync data across three primary collections: `users`, `transactions` and `reviews`.
* **Firebase Cloud Storage:** Used for storing and retrieving user profile images and professional media.
* **Expo Push API (Server-side):** Integrated to send push notifications to users based on database events (e.g., when a new hire request is created).



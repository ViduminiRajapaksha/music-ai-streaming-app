const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const registerRules = [
    (body) => {
        if (!body.username || body.username.trim().length < 3) {
            return "Username must be at least 3 characters";
        }
        return null;
    },
    (body) => {
        if (!body.email || !isValidEmail(body.email)) {
            return "A valid email is required";
        }
        return null;
    },
    (body) => {
        if (!body.password || body.password.length < 6) {
            return "Password must be at least 6 characters";
        }
        return null;
    }
];

const loginRules = [
    (body) => {
        if (!body.email || !isValidEmail(body.email)) {
            return "A valid email is required";
        }
        return null;
    },
    (body) => {
        if (!body.password) {
            return "Password is required";
        }
        return null;
    }
];

const updateProfileRules = [
    (body) => {
        if (body.username !== undefined && body.username.trim().length < 3) {
            return "Username must be at least 3 characters";
        }
        return null;
    },
    (body) => {
        if (body.favoriteGenres !== undefined && !Array.isArray(body.favoriteGenres)) {
            return "favoriteGenres must be an array";
        }
        return null;
    }
];

const changePasswordRules = [
    (body) => {
        if (!body.currentPassword) {
            return "Current password is required";
        }
        return null;
    },
    (body) => {
        if (!body.newPassword || body.newPassword.length < 6) {
            return "New password must be at least 6 characters";
        }
        return null;
    }
];

module.exports = {
    registerRules,
    loginRules,
    updateProfileRules,
    changePasswordRules
};

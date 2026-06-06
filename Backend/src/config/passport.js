const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

const ensureMinLength = (value, minimum, fallback) => {
    const normalized = (value || '').trim();
    if (normalized.length >= minimum) {
        return normalized;
    }
    return fallback;
};

const sanitizeUserNameSeed = (value) => {
    return (value || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '');
};

const generateUniqueUserName = async (seed) => {
    const normalizedSeed = sanitizeUserNameSeed(seed) || 'user';
    let candidate = normalizedSeed;
    let suffix = 0;

    while (await User.exists({ userName: candidate })) {
        suffix += 1;
        candidate = `${normalizedSeed}${suffix}`;
    }

    return candidate;
};

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (clientID && clientSecret) {
    passport.use(
        new GoogleStrategy(
            {
                clientID,
                clientSecret,
                callbackURL: '/user/google/callback',
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const profileEmail = profile?.emails?.[0]?.value?.toLowerCase();
                    if (!profileEmail) {
                        return done(new Error('Google account email not available'), null);
                    }

                    let user = await User.findOne({ googleId: profile.id });
                    if (user) {
                        return done(null, user);
                    }

                    user = await User.findOne({ emailId: profileEmail });
                    if (user) {
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            await user.save();
                        }
                        return done(null, user);
                    }

                    const givenName = profile?.name?.givenName;
                    const familyName = profile?.name?.familyName;
                    const displayName = profile?.displayName;

                    const firstName = ensureMinLength(
                        givenName || displayName,
                        3,
                        'GoogleUser',
                    );

                    const safeLastName = (familyName || '').trim();
                    const lastName = safeLastName.length >= 3 ? safeLastName : undefined;

                    const userNameSeed = profileEmail.split('@')[0] || displayName || firstName;
                    const userName = await generateUniqueUserName(userNameSeed);

                    user = await User.create({
                        firstName,
                        lastName,
                        emailId: profileEmail,
                        userName,
                        googleId: profile.id,
                        role: 'user',
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            },
        ),
    );
} else {
    console.warn('Google OAuth is disabled: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing');
}

module.exports = passport;

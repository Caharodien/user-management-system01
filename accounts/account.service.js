const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const sendEmail = require('_helpers/send-email');
const db = require('_helpers/db');
const Role = require('_helpers/role');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.findOne({ where: { email } });
    if (!account || !bcrypt.compareSync(password, account.passwordHash)) {
        throw 'Email or password is incorrect';
    }

    const jwtToken = generateJwtToken(account.id);
    const refreshToken = await generateRefreshToken(account, ipAddress);

    return { ...basicDetails(account), jwtToken, refreshToken: refreshToken.token };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const account = await getAccount(refreshToken.accountId);

    const newRefreshToken = await generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();

    const jwtToken = generateJwtToken(account.id);
    return { ...basicDetails(account), jwtToken, refreshToken: newRefreshToken.token };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function register(params) {
    const existingAccount = await db.Account.findOne({ where: { email: params.email } });

    if (existingAccount) {
        console.log('⚠️ Email already registered:', params.email);
        // OPTIONAL: Delete the unverified account so you can test again
        if (!existingAccount.verified) {
            console.log('🧹 Removing unverified account for re-registration...');
            await existingAccount.destroy();
        } else {
            return await sendAlreadyRegisteredEmail(params.email, params.origin);
        }
    }

    const account = new db.Account(params);
    const isFirstAccount = (await db.Account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();
    account.passwordHash = await hash(params.password);
    await account.save();

    console.log('✅ New account created:', account.email);
    console.log('🔐 Verification Token:', account.verificationToken);

    await sendVerificationEmail(account, params.origin);
}



async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ where: { verificationToken: token } });
    if (!account) throw 'Verification failed';
    account.verified = Date.now();
    account.verificationToken = null;
    await account.save();
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ where: { email } });
    if (!account) return;

    account.resetToken = {
        token: randomTokenString(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    await account.save();

    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        where: {
            'resetToken.token': token,
            'resetToken.expires': { [Op.gt]: Date.now() }
        }
    });
    if (!account) throw 'Invalid token';
    return account;
}

async function resetPassword({ token, password }) {
    const account = await validateResetToken({ token });
    account.passwordHash = await hash(password);
    account.resetToken = null;
    await account.save();
}

async function getAll() {
    const accounts = await db.Account.findAll();
    return accounts.map(x => basicDetails(x));
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params) {
    if (await db.Account.findOne({ where: { email: params.email } })) {
        throw `Email "${params.email}" is already registered`;
    }

    const account = new db.Account(params);
    account.verified = Date.now();
    account.passwordHash = await hash(params.password);
    await account.save();
    return basicDetails(account);
}

async function update(id, params) {
    const account = await getAccount(id);

    if (params.email !== account.email && await db.Account.findOne({ where: { email: params.email } })) {
        throw `Email "${params.email}" is already registered`;
    }

    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}

async function getAccount(id) {
    const account = await db.Account.findByPk(id);
    if (!account) throw 'Account not found';
    return account;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ where: { token } });
    if (!refreshToken) throw 'Invalid token';
    return refreshToken;
}

async function hash(password) {
    return await bcrypt.hash(password, 10);
}

function generateJwtToken(accountId) {
    return jwt.sign({ sub: accountId, exp: Math.floor(Date.now() / 1000) + (15 * 60) }, config.secret);
}

async function generateRefreshToken(account, ipAddress) {
    const refreshToken = new db.RefreshToken({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });
    await refreshToken.save();
    return refreshToken;
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, title, firstName, lastName, email, role, created, updated, isVerified } = account;
    return { id, title, firstName, lastName, email, role, created, updated, isVerified };
}

async function sendVerificationEmail(account, origin) {
    let verifyUrl = origin
        ? `${origin}/account/verify-email?token=${account.verificationToken}`
        : `http://localhost:3000/account/verify-email?token=${account.verificationToken}`;

    const message = `<p>Please click the below link to verify your email address:</p>
                     <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;

    await sendEmail({
        to: account.email,
        subject: 'Verify Email',
        html: `<h4>Verify Email</h4><p>Thanks for registering!</p>${message}`
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let resetUrl = origin
        ? `${origin}/account/forgot-password`
        : `http://localhost:3000/account/forgot-password`;

    const message = `<p>If you don't know your password please visit the <a href="${resetUrl}">${resetUrl}</a> page.</p>`;

    await sendEmail({
        to: email,
        subject: 'Sign-up Verification API - Email Already Registered',
        html: `<h4>Email Already Registered</h4><p>You are receiving this email because the email address ${email} is already registered.</p>${message}`
    });
}

async function sendPasswordResetEmail(account, origin) {
    let resetUrl = origin
        ? `${origin}/account/reset-password?token=${account.resetToken.token}`
        : `http://localhost:3000/account/reset-password?token=${account.resetToken.token}`;

    const message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                     <p><a href="${resetUrl}">${resetUrl}</a></p>`;

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Email</h4>${message}`
    });
}

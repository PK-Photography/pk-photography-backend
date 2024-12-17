const ORDER_STATUS = {
    pending : 0,
    Processing: 1,
    dispatched: 2,
    delivered: 3
}

const PAYMENT_STATUS = {
    notPaid: 0,
    paid: 1,
    COD: 2
}

const OTP_STATUS = {
    unverified: 0,
    verified: 1,
    expired: 2
}

const SUPPORT_TICKET_STATUS = {
    open: 0,
    Admin: 1,
    userSatisfied: 2,
    processing: 3
}

module.exports = {
    ORDER_STATUS,
    PAYMENT_STATUS,
    OTP_STATUS,
    SUPPORT_TICKET_STATUS
}
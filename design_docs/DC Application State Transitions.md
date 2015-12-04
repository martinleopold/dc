# create (G) [-> PENDING]
create application
transfer x credits from user to application (state: PENDING, credits: x)
* app.byUser authenticated
* app.host != app.byUser
* app.host is host of app.forDinner
* user.credits before = user.credits after + app.credits

# guest_change (G) [PENDING -> PENDING]
update app.notifyUntil, app.numSpots, app.credits, user.credits
* app.byUser authenticated
* app.numSpots = app.credits
* user.credits before = user.credits after + app.credits

# do_refund (G) [REFUND_PENDING -> RESOLVED]
update user.credits += app.credits, app.credits = 0, app.state = RESOLVED
* app.byUser authenticated
* user.credits after = user.credits before + app.credits before
* app.credits after = 0

# do_transfer (H) [TRANSFER_PENDING -> RESOLVED]
update host.credits += app.credits, app.credits = 0, app.state = RESOLVED
* app.host authenticated
* host.credits after = host.credits before + app.credits before
* app.credits after = 0

# guest_withdraws (G) [PENDING -> REFUND_PENDING]
update app.state = REFUND_PENDING
* app.byUser authenticated

# host_timeout (E) [PENDING -> REFUND_PENDING]
update app.state = REFUND_PENDING
* app.byUser authenticated || app.host authenticated
* now > app.timeout

# host_rejects (H) [PENDING -> REFUND_PENDING]
update app.state = REFUND_PENDING
* app.host authenticated

# host_accepts (H) [PENDING -> ACCEPTED.IDLE]
update app.state = ACCEPTED.IDLE
* app.host authenticated

# host_cancels (H) [ACCEPTED -> REFUND_PENDING]
update app.state = REFUND_PENDING
* app.host authenticated
* app.dinner is cancelled

# dinner_happened (E) [ACCEPTED -> TRANSFER_PENDING]
update app.state = TRANSFER_PENDING
* app.byUser authenticated || app.host authenticated
* now > app.dinner.time
* app.dinner not cancelled

# guest_requests_cancel (G) [ACCEPTED.IDLE -> ACCEPTED.CANCEL_REQUESTED]
update app.state = ACCEPTED.CANCEL_REQUESTED
* app.byUser authenticated

# cancel_granted (H) [ACCEPTED.CANCEL_REQUESTED -> REFUND_PENDIG]
update app.state = PENDING_REFUND
* app.host authenticated

# guest_requests_change (G) [ACCEPTED.IDLE -> ACCEPTED.CHANGE_REQUESTED]
update app.state = ACCEPTED.CHANGE_REQUESTED
update app.changes
* app.byUser authenticated
* app.changes before = null
* app.changes are different from current settings

# change_granted (H) [ACCEPTED.CHANGE_REQUESTED -> ACCEPTED.IDLE]
update app.state = ACCEPTED.CHANGE_REQUESTED
update app from app.changes, app.changes = 0
* app.host authenticated
* app after contains app.changes before
* app.changes after = 0

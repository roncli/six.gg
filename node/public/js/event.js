// MARK: class EventPage
/**
 * A class that provides functions for the event page.
 */
class EventPage {
    // MARK: static DOMContentLoaded
    /**
     * Sets up the page.
     * @returns {void}
     */
    static DOMContentLoaded() {
        const deleteBtn = document.getElementById("delete"),
            attendBtn = document.getElementById("attend"),
            leaveBtn = document.getElementById("leave"),
            errorDiv = document.getElementById("error");

        if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
                if (window.confirm("Are you sure you want to delete this event?")) {
                    document.body.style.cursor = "progress";

                    const res = await fetch(`/api/event/${deleteBtn.dataset.id}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });

                    if (res.status === 204) {
                        window.location.href = "/calendar";
                    } else {
                        errorDiv.innerText = "❌ Error deleting event.";
                        document.body.style.cursor = "";
                    }
                }
            });
        }

        if (attendBtn) {
            attendBtn.addEventListener("click", async () => {
                document.body.style.cursor = "progress";

                const res = await fetch(`/api/event/${attendBtn.dataset.id}/attendee`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (res.status === 201) {
                    window.location.reload();
                } else {
                    errorDiv.innerText = "❌ Error joining event.";
                    document.body.style.cursor = "";
                }
            });
        }

        if (leaveBtn) {
            leaveBtn.addEventListener("click", async () => {
                document.body.style.cursor = "progress";

                const res = await fetch(`/api/event/${leaveBtn.dataset.id}/attendee`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (res.status === 204) {
                    window.location.reload();
                } else {
                    errorDiv.innerText = "❌ Error leaving event.";
                    document.body.style.cursor = "";
                }
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", EventPage.DOMContentLoaded);

if (typeof module === "undefined") {
    window.EventPage = EventPage;
} else {
    module.exports = EventPage;
}

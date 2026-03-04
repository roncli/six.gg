const Attendee = require("../../../src/models/attendee"),
    Express = require("express"),
    HotRouter = require("hot-router"),
    Log = require("@roncli/node-application-insights-logger"),
    User = require("../../../src/models/user");

// MARK: class AttendeeApi
/**
 * A class that represents the attendee API.
 */
class AttendeeApi extends HotRouter.RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {HotRouter.RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/api/event/:id/attendee";

        route.middleware = [Express.json()];

        return route;
    }

    // MARK: static async post
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise<void>}
     */
    static async post(req, res) {
        try {
            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, you must log in first."});
                return;
            }

            const id = Number.isInteger(Number(req.params.id)) ? Number(req.params.id) : 0,
                added = await Attendee.add(id, user.id);

            if (!added) {
                res.status(404).json({error: "Not found, could not find an event with this ID."});
                return;
            }

            res.status(201).location(`/event/${id}`).json({eventId: id, userId: user.id});
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${AttendeeApi.route.path}.`, {err});
        }
    }

    // MARK: static async delete
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise<void>}
     */
    static async delete(req, res) {
        try {
            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, you must log in first."});
                return;
            }

            const id = Number.isInteger(Number(req.params.id)) ? Number(req.params.id) : 0,
                removed = await Attendee.remove(id, user.id);

            if (!removed) {
                res.status(404).json({error: "Not found, could not find an event with this ID."});
                return;
            }

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${AttendeeApi.route.path}.`, {err});
        }
    }
}

module.exports = AttendeeApi;

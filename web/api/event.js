const Event = require("../../src/models/event"),
    Express = require("express"),
    HotRouter = require("hot-router"),
    Log = require("@roncli/node-application-insights-logger"),
    User = require("../../src/models/user");

// MARK: class EventApi
/**
 * A class that represents the event API.
 */
class EventApi extends HotRouter.RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {HotRouter.RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/api/event/:id";

        route.middleware = [Express.json()];

        return route;
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
                removed = await Event.remove(id, user.id);

            if (!removed) {
                res.status(404).json({error: "Not found, could not find an event with this ID owned by this user."});
                return;
            }

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${EventApi.route.path}.`, {err});
        }
    }
}

module.exports = EventApi;

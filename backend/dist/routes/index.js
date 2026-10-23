"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_routes_js_1 = __importDefault(require("./product.routes.js"));
const customer_routes_js_1 = __importDefault(require("./customer.routes.js"));
const behavior_routes_js_1 = __importDefault(require("./behavior.routes.js"));
const recommendation_routes_js_1 = __importDefault(require("./recommendation.routes.js"));
const auth_routes_js_1 = __importDefault(require("./auth.routes.js"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_js_1.default);
router.use('/products', product_routes_js_1.default);
router.use('/customers', customer_routes_js_1.default);
router.use('/behavior', behavior_routes_js_1.default);
router.use('/recommendations', recommendation_routes_js_1.default);
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Shốp Pii Recommendation System Backend API',
    });
});
exports.default = router;

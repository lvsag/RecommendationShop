"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recommendation_controller_js_1 = require("../controllers/recommendation.controller.js");
const router = (0, express_1.Router)();
router.get('/:customerId', recommendation_controller_js_1.getRecommendations);
router.get('/:customerId/explain', recommendation_controller_js_1.explainRecommendationQuery);
exports.default = router;

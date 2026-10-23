"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const behavior_controller_js_1 = require("../controllers/behavior.controller.js");
const router = (0, express_1.Router)();
router.post('/view', behavior_controller_js_1.logView);
router.post('/buy', behavior_controller_js_1.logBuy);
router.post('/checkout', behavior_controller_js_1.checkout);
exports.default = router;

import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/brand/logo.png";
import logoLight from "../assets/brand/logo-light.png";

// Prequisa wordmark. `light` uses the white-text version for dark backgrounds
// (sidebar, auth panels); the icon keeps its colours either way.
const BrandLogo = ({ light = false, size = "md", to = "/" }) => (
  <Link to={to} className="inline-flex items-center" aria-label="Prequisa home">
    <img
      src={light ? logoLight : logo}
      alt="Prequisa"
      className={`${size === "sm" ? "h-6" : "h-8"} w-auto select-none`}
      draggable="false"
    />
  </Link>
);

export default BrandLogo;

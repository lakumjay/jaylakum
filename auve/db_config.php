<?php
/**
 * AUVÉ Dynamic Footwear Store — Database Configuration
 *
 * For phpMyAdmin / MySQL hosting on cPanel or Localhost.
 * Update these details with your cPanel MySQL Database credentials if needed.
 */

// Database Host (usually localhost)
defined('AUVE_DB_HOST') or define('AUVE_DB_HOST', getenv('DB_HOST') ?: 'localhost');

// Database Name (e.g. auve_store or snweba2e_auve)
defined('AUVE_DB_NAME') or define('AUVE_DB_NAME', getenv('DB_NAME') ?: 'auve_store');

// Database User
defined('AUVE_DB_USER') or define('AUVE_DB_USER', getenv('DB_USER') ?: 'root');

// Database Password
defined('AUVE_DB_PASS') or define('AUVE_DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');

// Admin Default Fallback Password
defined('AUVE_DEFAULT_ADMIN_PASS') or define('AUVE_DEFAULT_ADMIN_PASS', 'CHANGE-ME-auve-admin');

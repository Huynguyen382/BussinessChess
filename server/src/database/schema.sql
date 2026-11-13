-- SCHEMA POSTGRESQL & SQLITE COMPATIBLE CHO BUSINESS CHESS 3D
-- Phục vụ Authentication, User Sessions, In-Game Achievements & Match History

-- 1. Bảng Người dùng (Users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    gold_balance BIGINT DEFAULT 10000,
    total_matches INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Bảng Phiên Đăng Nhập (User Sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 3. Bảng Thành Tựu (Achievements Catalog)
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) DEFAULT '🏆',
    category VARCHAR(50) DEFAULT 'GENERAL', -- 'GAMEPLAY', 'WEALTH', 'SPECIAL', 'COLLECTION'
    reward_gold BIGINT DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_achievements_code ON achievements(code);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- 4. Bảng Tiến Độ & Mở Khóa Thành Tựu Người Chơi (User Achievements)
CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress INT DEFAULT 100,
    is_claimed BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);

-- 5. Bảng Bạn bè (Friendships)
CREATE TABLE IF NOT EXISTS friendships (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    friend_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'BLOCKED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- 6. Bảng Phòng chơi (Game Rooms)
CREATE TABLE IF NOT EXISTS game_rooms (
    id VARCHAR(36) PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_id VARCHAR(36) REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    max_players INT DEFAULT 4,
    turn_timeout_seconds INT DEFAULT 30,
    initial_balance BIGINT DEFAULT 1500,
    is_private BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'WAITING', -- 'WAITING', 'PLAYING', 'FINISHED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- 7. Bảng Lịch sử ván đấu & Thành viên tham gia (Match Participants)
CREATE TABLE IF NOT EXISTS match_participants (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id),
    final_rank INT,
    net_worth BIGINT DEFAULT 0,
    is_bankrupt BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bảng Lưu trữ Trạng thái ván cờ (Game States Snapshot)
CREATE TABLE IF NOT EXISTS game_states (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) UNIQUE REFERENCES game_rooms(id) ON DELETE CASCADE,
    current_turn_user_id VARCHAR(36) REFERENCES users(id),
    turn_phase VARCHAR(30) NOT NULL,
    state_json TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dữ Liệu Khởi Tạo: Danh mục Thành tựu chuẩn trong trò chơi
INSERT INTO achievements (id, code, name, description, icon, category, reward_gold) VALUES
('first_property', 'FIRST_PROPERTY', 'Nhà Đầu Tư Mới', 'Mua bất động sản đầu tiên trên bàn cờ Việt Nam', '🏠', 'GAMEPLAY', 500)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO achievements (id, code, name, description, icon, category, reward_gold) VALUES
('monopolist', 'MONOPOLIST', 'Độc Quyền Khu Phố', 'Sở hữu toàn bộ các lô đất trong cùng một khu vực màu', '👑', 'GAMEPLAY', 1200)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO achievements (id, code, name, description, icon, category, reward_gold) VALUES
('rent_baron', 'RENT_BARON', 'Ông Trùm Thu Tô', 'Thu về từ 500M tiền thuê nhà từ đối thủ trong một trận đấu', '💰', 'WEALTH', 1500)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO achievements (id, code, name, description, icon, category, reward_gold) VALUES
('landlord_legend', 'LANDLORD_LEGEND', 'Huyền Thoại Khách Sạn', 'Xây dựng thành công Landmark / Khách Sạn 5 sao cao cấp', '🏨', 'GAMEPLAY', 2000)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO achievements (id, code, name, description, icon, category, reward_gold) VALUES
('lucky_roller', 'LUCKY_ROLLER', 'Bàn Tay Vàng', 'Đổ được 2 lần xúc xắc đôi liên tiếp trong cùng một lượt', '🎲', 'SPECIAL', 800)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO achievements (id, code, name, description, icon, category, reward_gold) VALUES
('comeback_king', 'COMEBACK_KING', 'Vua Lội Ngược Dòng', 'Tài sản từng tụt dưới 200M nhưng sau đó lội ngược dòng chiến thắng', '⚡', 'SPECIAL', 2500)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO achievements (id, code, name, description, icon, category, reward_gold) VALUES
('clean_sheet', 'CLEAN_SHEET', 'Thoát Hiểm Ngoạn Mục', 'Hoàn thành trọn vẹn 1 vòng bàn cờ mà không mất đồng tiền thuê nào', '🛡️', 'GAMEPLAY', 1000)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO achievements (id, code, name, description, icon, category, reward_gold) VALUES
('millionaire', 'MILLIONAIRE', 'Đại Phú Hào Triệu Đô', 'Đạt tổng tài sản ròng tích lũy từ 5,000M trở lên', '💎', 'WEALTH', 3000)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

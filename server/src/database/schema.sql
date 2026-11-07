-- SCHEMA POSTGRESQL CHO BUSINESS CHESS 3D
-- Theo tài liệu đặc tả GAME_DESIGN_DOCUMENT.md mục 6

-- 1. Bảng Người dùng
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    gold_balance BIGINT DEFAULT 10000,
    total_matches INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Bạn bè
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'BLOCKED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- 3. Bảng Phòng chơi
CREATE TABLE IF NOT EXISTS game_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    max_players INT DEFAULT 4,
    turn_timeout_seconds INT DEFAULT 30,
    initial_balance BIGINT DEFAULT 1500,
    is_private BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'WAITING', -- 'WAITING', 'PLAYING', 'FINISHED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE
);

-- 4. Bảng Lịch sử ván đấu & Thành viên tham gia
CREATE TABLE IF NOT EXISTS match_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    final_rank INT,
    net_worth BIGINT DEFAULT 0,
    is_bankrupt BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bảng Lưu trữ Trạng thái ván cờ (Snapshot để Reconnect)
CREATE TABLE IF NOT EXISTS game_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID UNIQUE REFERENCES game_rooms(id) ON DELETE CASCADE,
    current_turn_user_id UUID REFERENCES users(id),
    turn_phase VARCHAR(30) NOT NULL, -- 'ROLL_DICE', 'BUY_TILE', 'UPGRADE', 'END_TURN'
    state_json JSONB NOT NULL,       -- Toàn bộ vị trí quân cờ, quyền sở hữu đất, khách sạn
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

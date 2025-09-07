CREATE OR REPLACE FUNCTION find_user(
    p_id INTEGER DEFAULT NULL,
    p_username VARCHAR(50) DEFAULT NULL,
    p_email VARCHAR(50) DEFAULT NULL,
    p_phone VARCHAR(50) DEFAULT NULL,
    p_password VARCHAR(50) DEFAULT NULL
) 
RETURNS JSON AS $$
DECLARE
    user_exists INTEGER;
    user_iconurl VARCHAR(255):=NULL;
    userid INTEGER;
    res JSON;
BEGIN
    -- 检查用户是否存在且密码正确
    SELECT COUNT(*), id, iconurl INTO user_exists, userid, user_iconurl
    FROM PigChessUser 
    WHERE (p_id IS NOT NULL AND id = p_id)
       OR (p_username IS NOT NULL AND UserName = p_username)
       OR (p_email IS NOT NULL AND Email = p_email)
       OR (p_phone IS NOT NULL AND Phone = p_phone)
       AND PassWord = p_password
    GROUP BY id;
    
    IF user_exists > 0 THEN
        res:= json_build_object(
            'id',userid,
            'username', p_username,
            'password', p_password,
            'iconurl', user_iconurl,
            'exits',user_exists,
            'errorcode',1,
            'error','success'
        );
    ELSE
        res:= json_build_object(
            'id',userid,
            'username', p_username,
            'password', p_password,
            'iconurl', user_iconurl,
            'exits',user_exists,
            'errorcode',0,
            'error','user not found or password incorrect'
        );
    END IF;
    RETURN res;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        RETURN json_build_object(
            'id',-1,
            'username', p_username,
            'password', p_password,
            'iconurl', NULL,
            'exits',0,
            'errorcode',0,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_user(
    p_username VARCHAR(50) DEFAULT NULL,
    p_email VARCHAR(50) DEFAULT NULL,
    p_phone VARCHAR(50) DEFAULT NULL,
    p_password VARCHAR(50) DEFAULT NULL,
    p_nickname VARCHAR(50) DEFAULT NULL
) 
RETURNS INTEGER AS $$
DECLARE
    success INTEGER := 0;
BEGIN
    -- 插入新用户
    INSERT INTO pigchessuser (create_time, username, email, password, nickname, phone)
    VALUES (now(), p_username, p_email, p_password, p_nickname, p_phone);
    
    success := 1;
    RETURN success;
    
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_data(
    p_id INTEGER DEFAULT NULL,
    p_username VARCHAR(50) DEFAULT NULL,
    p_password VARCHAR(50) DEFAULT NULL,
    p_new_username VARCHAR(50) DEFAULT NULL,
    p_new_email VARCHAR(50) DEFAULT NULL,
    p_new_phone VARCHAR(50) DEFAULT NULL,
    p_new_nickname VARCHAR(50) DEFAULT NULL,
    p_new_iconurl VARCHAR(255) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    res JSON;
BEGIN
    IF p_id IS NULL OR p_username IS NULL OR p_password IS NULL OR p_new_email IS NULL THEN
        res:= json_build_object(
            'errorcode', 0,
            'errordetail', 'Missing required fields'
        );
        RETURN res;
    END IF;
    IF p_new_username IS NOT NULL THEN
        UPDATE pigchessuser
        SET username = p_new_username
        WHERE id = p_id AND username = p_username AND password = p_password;
    END IF;
    IF p_new_email IS NOT NULL THEN
        UPDATE pigchessuser
        SET email = p_new_email
        WHERE id = p_id AND username = p_username AND password = p_password;
    END IF;
    IF p_new_phone IS NOT NULL THEN
        UPDATE pigchessuser
        SET phone = p_new_phone
        WHERE id = p_id AND username = p_username AND password = p_password;
    END IF;
    IF p_new_nickname IS NOT NULL THEN
        UPDATE pigchessuser
        SET nickname = p_new_nickname
        WHERE id = p_id AND username = p_username AND password = p_password;
    END IF;
    IF p_new_iconurl IS NOT NULL THEN
        UPDATE pigchessuser
        SET iconurl = p_new_iconurl
        WHERE id = p_id AND username = p_username AND password = p_password;
    END IF;

    res:= json_build_object(
        'errorcode', 1,
        'errordetail', 'update success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        res:=json_build_object(
            'errorcode', 0,
            'errordetail', SQLERROR
        );
        RETURN res;
END
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_user_password(
    p_email VARCHAR(50) DEFAULT NULL,
    p_new_password VARCHAR(50) DEFAULT NULL
) 
RETURNS JSON AS $$
DECLARE
    res JSON;
BEGIN
    IF p_email IS NULL THEN
        res:= json_build_object(
            'errorcode', 0,
            'errordetail', 'Missing required fields'
        );
        RETURN res;
    END IF;
    UPDATE pigchessuser
    SET password = p_new_password
    WHERE email = p_email;
    res:= json_build_object(
        'errorcode', 1,
        'errordetail', 'update success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        res:=json_build_object(
            'errorcode', 0,
            'errordetail', SQLERROR
        );
        RETURN res;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_area_player(
    p_user_id INTEGER DEFAULT NULL,
    p_area_id VARCHAR(50) DEFAULT NULL,
    p_area_playername VARCHAR(50) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    success INTEGER := 0;
    area_name VARCHAR(50):='pigchessarea';
BEGIN

    IF p_user_id IS NULL OR p_area_id IS NULL OR p_area_playername IS NULL THEN
        RETURN 0;
    END IF;

    area_name := area_name+p_area_id;
    -- 插入新用户
    INSERT INTO area_name (create_time,userid, area1playername)
    VALUES (now(),p_user_id,p_area_playername);
    success := 1;
    RETURN success;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_pigchessarea_data(
    p_area_id VARCHAR(50),
    user_id INTEGER,
    coin_change_num INTEGER,
    diamond_change_num INTEGER,
    pigcoin_change_num INTEGER,
    rankpoint_change_num INTEGER,
    exppoint_change_num INTEGER,
    S00_change_num INTEGER,
    S01_change_num INTEGER
)
RETURNS JSON AS $$
DECLARE
    res Json;
    area_name VARCHAR(50):='pigchessarea';
BEGIN
    IF  p_area_id IS NULL THEN
        res:= json_build_object(
            'errorcode', 0,
            'errordetail', 'Missing required fields'
        );
        RETURN res;
    END IF;
    area_name := area_name||p_area_id;
    UPDATE area_name
    SET
        coin = coin + coin_change_num,
        diamond = diamond + diamond_change_num,
        pigcoin = pigcoin + pigcoin_change_num,
        rankpoint = rankpoint + rankpoint_change_num,
        exppoint = exppoint + exppoint_change_num,
        s00 = s00 + S00_change_num,
        s01 = s01 + S01_change_num
    WHERE userid = user_id;
    res:= json_build_object(
        'errorcode', 1,
        'error', 'update success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        res:=json_build_object(
            'errorcode', 0,
            'error', SQLERROR
        );
        RETURN res;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_friend_apply(
    p_from_userid INTEGER DEFAULT NULL,
    p_to_userid INTEGER DEFAULT NULL,
    p_apply_from_area VARCHAR(50) DEFAULT NULL,
    p_apply_to_area VARCHAR(50) DEFAULT NULL,
    p_from_playername VARCHAR(50) DEFAULT NULL,
    p_to_playername VARCHAR(50) DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
BEGIN
    IF p_from_userid IS NULL OR p_to_userid IS NULL OR p_apply_from_area IS NULL OR p_apply_to_area IS NULL OR p_from_playername IS NULL OR p_to_playername IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'errordetail', 'Missing required fields'
        );
        RETURN res;
    END IF;
    -- 检查是否已经存在未处理的申请
    IF EXISTS (SELECT 1 FROM friend_apply_table 
               WHERE from_userid = p_from_userid 
                 AND to_userid = p_to_userid 
                 AND status = 0) THEN
        UPDATE friend_apply_table
        SET create_time = now()
        WHERE from_userid = p_from_userid 
          AND to_userid = p_to_userid 
          AND status = 0;
        res= json_build_object(
            'errorcode', 1,
            'errordetail', 'Application already exists'
        );
        RETURN res;
    END IF;

    INSERT INTO friend_apply_table (create_time, from_userid, to_userid, apply_from_area, apply_to_area, from_playername, to_playername, status)
    VALUES (now(), p_from_userid, p_to_userid, p_apply_from_area, p_apply_to_area, p_from_playername, p_to_playername, 0);
    res= json_build_object(
        'errorcode', 1,
        'errordetail', 'insert success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        res= json_build_object(
            'errorcode', 0,
            'errordetail', SQLERROR
        );
        RETURN res;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_friend_apply_status(
    p_from_userid INTEGER DEFAULT NULL,
    p_to_userid INTEGER DEFAULT NULL,
    p_status INTEGER DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
    updated_row RECORD;
BEGIN
    IF p_from_userid IS NULL OR p_to_userid IS NULL OR p_status IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'errordetail', 'Missing required fields'
        );
        RETURN res;
    END IF;

    UPDATE friend_apply_table
    SET status = p_status
    WHERE from_userid = p_from_userid AND to_userid = p_to_userid
    RETURNING * INTO updated_row;
    PERFORM insert_friend(p_from_userid,p_to_userid,updated_row.apply_to_area,updated_row.to_playername);
    PERFORM insert_friend(p_to_userid,p_from_userid,updated_row.apply_from_area,updated_row.from_playername);

    res= json_build_object(
        'errorcode', 1,
        'errordetail', 'update success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        res= json_build_object(
            'errorcode', 0,
            'errordetail', SQLERROR
        );
        RETURN res;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_friend(
    p_userid INTEGER DEFAULT NULL,
    p_friend_userid INTEGER DEFAULT NULL,
    p_friend_in_whitch_area VARCHAR(50) DEFAULT NULL,
    p_friend_playername VARCHAR(50) DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
BEGIN
    IF p_userid IS NULL OR p_friend_userid IS NULL OR p_friend_in_whitch_area IS NULL OR p_friend_playername IS NUll THEN
        res= json_build_object(
            'errorcode', 0,
            'errordetail', 'Missing required fields'
        );
        RETURN res;
    END IF;
    INSERT INTO pigchessfriend (create_time, userid, friend_userid, friend_in_whitch_area,friend_playername)
    VALUES (now(), p_userid, p_friend_userid, p_friend_in_whitch_area, p_friend_playername);
    res= json_build_object(
        'errorcode', 1,
        'errordetail', 'insert success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        res= json_build_object(
            'errorcode', 0,
            'errordetail', SQLERROR
        );
        RETURN res;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION trigger_fun_Del_Which_TimeOut()
RETURNS TRIGGER AS $body$
BEGIN
    -- 删除 create_time 早于当前时间 7 天的记录
    DELETE FROM friend_apply_table
    WHERE create_time < NOW() - INTERVAL '7 days';

    -- 返回新插入或更新的行
    RETURN NEW;
END;
$body$ LANGUAGE plpgsql;






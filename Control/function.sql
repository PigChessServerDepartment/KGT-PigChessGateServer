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
    user_token VARCHAR(255):=NULL;
    user_token_create_time TIMESTAMP:=NULL;
    res JSON;
BEGIN
    -- 检查用户是否存在且密码正确
    SELECT COUNT(*), id, iconurl,refresh_token,token_createtime 
    INTO user_exists, userid, user_iconurl, user_token, user_token_create_time
    FROM PigChessUser 
    WHERE (p_id IS NOT NULL AND id = p_id)
       OR (p_username IS NOT NULL AND UserName = p_username)
       OR (p_email IS NOT NULL AND Email = p_email)
       OR (p_phone IS NOT NULL AND Phone = p_phone)
       AND PassWord = p_password
    GROUP BY id;
    IF user_token_create_time IS NOT NULL AND user_token_create_time < now() - interval '7 days' THEN
        user_token := NULL;
    END IF;

    IF user_exists > 0 THEN
        res:= json_build_object(
            'id',userid,
            'username', p_username,
            'password', p_password,
            'iconurl', user_iconurl,
            'token', user_token,
            'token_createtime', user_token_create_time,
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
            'token', NULL,
            'token_createtime', NULL,
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
            'token', NULL,
            'token_createtime', NULL,
            'exits',0,
            'errorcode',0,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION uptate_user_token(
    p_id INTEGER DEFAULT NULL,
    p_token VARCHAR(255) DEFAULT NULL,
    p_createtime TIMESTAMP DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    res JSON;
BEGIN
    IF p_id IS NULL OR p_token IS NULL THEN
        res:= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    UPDATE pigchessuser
    SET refresh_token = p_token,
        token_createtime = p_createtime
    WHERE id = p_id;
    res:= json_build_object(
        'errorcode', 1,
        'error', 'updatetoken success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        res:=json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
        RETURN res;
END
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
            'error', 'Missing required fields'
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
        'error', 'update success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        res:=json_build_object(
            'errorcode', 0,
            'error', SQLERRM
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
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    UPDATE pigchessuser
    SET password = p_new_password
    WHERE email = p_email;
    res:= json_build_object(
        'errorcode', 1,
        'error', 'update success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        res:=json_build_object(
            'errorcode', 0,
            'error', SQLERRM
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
            'error', 'Missing required fields'
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
            'error', SQLERRM
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
            'error', 'Missing required fields'
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
            'error', 'Application already exists'
        );
        RETURN res;
    END IF;

    INSERT INTO friend_apply_table (create_time, from_userid, to_userid, apply_from_area, apply_to_area, from_playername, to_playername, status)
    VALUES (now(), p_from_userid, p_to_userid, p_apply_from_area, p_apply_to_area, p_from_playername, p_to_playername, 0);
    res= json_build_object(
        'errorcode', 1,
        'error', 'insert success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        res= json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
        RETURN res;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_friend_apply_status(
    p_from_userid INTEGER DEFAULT NULL,
    p_to_userid INTEGER DEFAULT NULL,
    p_apply_from_area VARCHAR(50) DEFAULT NULL,
    p_apply_to_area VARCHAR(50) DEFAULT NULL,
    p_from_playername VARCHAR(50) DEFAULT NULL,
    p_to_playername VARCHAR(50) DEFAULT NULL,
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
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;

    IF p_status=1 THEN
        PERFORM insert_friend(p_from_userid,p_to_userid,p_apply_to_area,p_to_playername);
        PERFORM insert_friend(p_to_userid,p_from_userid,p_apply_from_area,p_from_playername);
    END IF;

    UPDATE friend_apply_table
    SET status = p_status
    WHERE from_userid = p_from_userid AND to_userid = p_to_userid AND from_playername = p_from_playername AND to_playername = p_to_playername;


    res= json_build_object(
        'errorcode', 1,
        'error', 'update success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        res= json_build_object(
            'errorcode', 0,
            'error', SQLERRM
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
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    INSERT INTO pigchessfriend (create_time, userid, friend_userid, friend_in_whitch_area,friend_playername)
    VALUES (now(), p_userid, p_friend_userid, p_friend_in_whitch_area, p_friend_playername);
    res= json_build_object(
        'errorcode', 1,
        'error', 'insert success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        res= json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
        RETURN res;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_friend_apply_table(
    p_to_userid INTEGER DEFAULT NULL,
    p_to_playername VARCHAR(50) DEFAULT NULL,
    p_apply_to_area VARCHAR(50) DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
    search_data JSON;
BEGIN
    IF p_to_userid IS NULL OR p_to_playername IS NULL OR p_apply_to_area IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    -- 使用 INTO 语句将查询结果存储到 search_data 中
    SELECT json_agg(row_to_json(t))
    INTO search_data
    FROM friend_apply_table t
    WHERE to_userid = p_to_userid 
      AND to_playername = p_to_playername 
      AND apply_to_area = p_apply_to_area;

    -- 检查搜索结果是否为空
    IF search_data IS NULL THEN
        search_data := '[]'::JSON;  -- 返回空数组
    END IF;

    res := json_build_object(
        'errorcode', 1,
        'error', 'search success',
        'data', search_data
    );

    RETURN res;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        res= json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
        RETURN res;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION find_area_playername(
    p_playername VARCHAR(50) DEFAULT NULL,
    p_area INTEGER DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
    search_data JSON[]:= ARRAY[]::JSON[];
    tmp_search_data JSON;
    table_names TEXT[];
    table_data TEXT;
    tablename TEXT;
    columnname TEXT;
    i INT;
BEGIN
    IF p_playername IS NULL OR p_area IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;

    SELECT array_agg(tablename)
    FROM pg_tables 
    INTO table_names
    WHERE schemaname = 'public' -- 或者其他 schema 名称
    AND tablename LIKE 'pigchessarea%';

    -- 遍历数组
    IF p_area = -1 THEN
        FOR i IN 1..array_length(table_names, 1) LOOP
            tablename := table_names[i];
            columnname := 'area' || i || 'playername';
            EXECUTE format(
                'SELECT json_agg(row_to_json(t))
                 FROM %I t
                 WHERE %I= $1',
                tablename,columnname
            ) 
            INTO tmp_search_data 
            USING p_playername;
            IF tmp_search_data IS NOT NULL THEN
                search_data := array_append(search_data, tmp_search_data);
            END IF;
        END LOOP;
    ELSE
        -- 如果指定了具体区域，只搜索对应表
        tablename := 'pigchessarea' || p_area;
        -- 检查表是否存在
        IF EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = tablename AND schemaname = 'public'
        ) THEN
            columnname := 'area' || p_area || 'playername';
            EXECUTE format(
                'SELECT json_agg(row_to_json(t)) 
                 FROM %I t 
                 WHERE %I = $1',  -- 假设列名就是 playername
                tablename,columnname
            ) 
            INTO tmp_search_data
            USING p_playername;
            
            IF tmp_search_data IS NOT NULL THEN
                search_data := array_append(search_data, tmp_search_data);
            END IF;
        END IF;
    END IF;

    IF search_data IS NULL THEN
        search_data := '[]'::JSON;  -- 返回空数组
    END IF;

    res := json_build_object(
        'errorcode', 1,
        'error', 'search success',
        'data', search_data
    );

    RETURN res;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        res= json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
        RETURN res;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION select_area_player_history(
    p_playername VARCHAR(50) DEFAULT NULL,
    p_area INTEGER DEFAULT NULL,
    userid INTEGER DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
    search_data JSON;
BEGIN
    IF p_playername IS NULL OR p_area IS NULL OR userid IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    -- 使用 INTO 语句将查询结果存储到 search_data 中
    SELECT json_agg(row_to_json(t))
    INTO search_data
    FROM area_player_history_table t
    WHERE areaplayername = p_playername 
      AND area = p_area
      AND userid = userid;
    -- 检查搜索结果是否为空
    IF search_data IS NULL THEN
        search_data := '[]'::JSON;  -- 返回空数组
    END IF;
    res := json_build_object(
        'errorcode', 1,
        'error', 'search success',
        'data', search_data
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        res= json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
        RETURN res;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION area_player_data_trace_back(
    p_playername VARCHAR(50) DEFAULT NULL,
    p_area INTEGER DEFAULT NULL,
    p_pre_hours INTEGER DEFAULT NULL,
    userid INTEGER DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
    tablename TEXT;
BEGIN
    IF p_playername IS NULL OR p_area IS NULL OR p_pre_hours IS NULL OR userid IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    PERFORM set_config(
        'pigchess.from_func',
        'area_player_data_trace_back',
        true        -- 只在当前事务有效
    );

    tablename := format('pigchessarea%s', p_area);
    EXECUTE format
    ($sql$
        UPDATE %I parea
        SET
        coin      = aph.coin,
        diamond   = aph.diamond,
        pigcoin   = aph.pigcoin,
        rankpoint = aph.rankpoint,
        exppoint  = aph.exppoint,
        s00       = aph.s00,
        s01       = aph.s01
        FROM (
            SELECT *
            FROM area_player_history_table
            WHERE areaplayername = $1
            AND area = $2
            AND userid = $3
            AND valid_to <= NOW() - INTERVAL '1 hour' * $4
            ORDER BY valid_to DESC NULLS LAST LIMIT 1
        ) AS aph
        WHERE parea.area1playername = aph.areaplayername
        AND parea.userid = aph.userid
    $sql$, tablename)
    USING p_playername, p_area, userid, p_pre_hours;

    res := json_build_object(
        'errorcode', 1,
        'error', 'search success'
    );
    RETURN res;
EXCEPTION
    WHEN others THEN
        -- 发生任何异常时返回0
        res= json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
        RETURN res;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION trigger_fun_Del_Which_TimeOut()
RETURNS TRIGGER AS $body$
BEGIN
    -- 删除 create_time 早于当前时间 3 天的记录
    DELETE FROM friend_apply_table
    WHERE create_time < NOW() - INTERVAL '3 days' OR status != 0;

    -- 返回新插入或更新的行
    RETURN NEW;
END;
$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION track_area1_player_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 新插入的记录
        INSERT INTO area_player_history_table (
            create_time,
            areaplayername,
            area,
            coin,
            diamond,
            pigcoin,
            rankpoint,
            exppoint,
            s00,
            s01,
            valid_from,
            valid_to,
            operation_type,
            userid
        ) VALUES (
            NEW.create_time,
            NEW.area1playername,
            1,
            NEW.coin,
            NEW.diamond,
            NEW.pigcoin,
            NEW.rankpoint,
            NEW.exppoint,
            NEW.s00,
            NEW.s01,
            NOW(),
            NULL,
            'I',
            NEW.userid
        );

    ELSIF TG_OP = 'UPDATE' THEN
        -- 首先关闭旧记录的有效期
        UPDATE area_player_history_table 
        SET valid_to = NOW() 
        WHERE areaplayername = NEW.area1playername 
          AND area = 1 
          AND valid_to IS NULL;
        IF current_setting('pigchess.from_func', true)= 'area_player_data_trace_back' THEN
            -- 插入更新后的新记录
            INSERT INTO area_player_history_table (create_time,areaplayername,area,coin,diamond,pigcoin,rankpoint,exppoint,s00,s01,valid_from,valid_to,operation_type,userid)
            VALUES (NEW.create_time,NEW.area1playername,1,NEW.coin,NEW.diamond,NEW.pigcoin,NEW.rankpoint,NEW.exppoint,NEW.s00,NEW.s01,NOW(),NULL,'H',NEW.userid);
        ELSE
            -- 插入更新后的新记录
            INSERT INTO area_player_history_table (create_time,areaplayername,area,coin,diamond,pigcoin,rankpoint,exppoint,s00,s01,valid_from,valid_to,operation_type,userid)
            VALUES (NEW.create_time,NEW.area1playername,1,NEW.coin,NEW.diamond,NEW.pigcoin,NEW.rankpoint,NEW.exppoint,NEW.s00,NEW.s01,NOW(),NULL,'U',NEW.userid);
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- 关闭被删除记录的有效期
        UPDATE area_player_history_table 
        SET valid_to = NOW() 
        WHERE areaplayername = OLD.area1playername 
          AND area = 1 
          AND valid_to IS NULL;
        
        -- 记录删除操作
        INSERT INTO area_player_history_table (create_time,areaplayername,area,coin,diamond,pigcoin,rankpoint,exppoint,s00,s01,valid_from,valid_to,operation_type,userid)
         VALUES (OLD.create_time,OLD.area1playername,1,OLD.coin,OLD.diamond,OLD.pigcoin,OLD.rankpoint,OLD.exppoint,OLD.s00,OLD.s01,NOW(),NOW(),'D',OLD.userid);

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;




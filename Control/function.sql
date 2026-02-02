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

CREATE OR REPLACE FUNCTION clear_area_player_history_table()
RETURNS Json AS $$
DECLARE
    res Json;
BEGIN
    DELETE FROM area_player_history_table
    WHERE valid_to IS NOT NULL
      AND valid_to < NOW() - INTERVAL '14 days';
    res := json_build_object(
        'errorcode', 1,
        'error', 'clear success'
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

CREATE OR REPLACE FUNCTION update_area_player_email(
    p_email_id BIGINT DEFAULT NULL,
    p_status INTEGER DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
BEGIN
    IF p_email_id IS NULL OR p_status IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    UPDATE area_player_email_table
    SET status = p_status
    WHERE email_id = p_email_id;
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

CREATE OR REPLACE FUNCTION search_area_player_email(
    p_to_userid INTEGER DEFAULT NULL,
    p_to_playername VARCHAR(100) DEFAULT NULL,
    p_to_area INTEGER DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
    search_data JSON;
BEGIN
    IF p_to_userid IS NULL OR p_to_playername IS NULL OR p_to_area IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    -- 使用 INTO 语句将查询结果存储到 search_data 中
    SELECT json_agg(row_to_json(t))
    INTO search_data
    FROM area_player_email_table t
    WHERE to_userid = p_to_userid
        AND to_playername = p_to_playername
        AND to_area = p_to_area;
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

CREATE OR REPLACE FUNCTION insert_area_player_email(
    p_keep_days INTEGER DEFAULT NULL,
    p_from_userid INTEGER DEFAULT NULL,
    p_to_userid INTEGER DEFAULT NULL,
    p_from_playername VARCHAR(100) DEFAULT NULL,
    p_to_playername VARCHAR(100) DEFAULT NULL,
    p_from_area INTEGER DEFAULT NULL,
    p_to_area INTEGER DEFAULT NULL,
    p_email_content TEXT DEFAULT NULL,
    p_type INTEGER DEFAULT NULL,
    p_stuff_json JSON DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
BEGIN
    IF p_keep_days IS NULL OR p_from_userid IS NULL OR p_to_userid IS NULL OR p_from_playername IS NULL OR p_to_playername IS NULL OR p_from_area IS NULL OR p_to_area IS NULL OR p_email_content IS NULL OR p_type IS NULL OR p_stuff_json IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    INSERT INTO area_player_email_table (create_time, keep_days, from_userid, to_userid, from_playername, to_playername, from_area, to_area, email_content, type, status, stuff_json)
    VALUES (now(), p_keep_days, p_from_userid, p_to_userid, p_from_playername, p_to_playername, p_from_area, p_to_area, p_email_content, p_type, 0, p_stuff_json);
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

CREATE OR REPLACE FUNCTION search_system_email(
    p_to_area INTEGER DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
    search_data JSON;
BEGIN
    IF p_to_area IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    -- 使用 INTO 语句将查询结果存储到 search_data 中
    SELECT json_agg(row_to_json(t))
    INTO search_data
    FROM system_email_table t
    WHERE to_area = p_to_area;
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

-- 创建通用的数组按位或函数
CREATE OR REPLACE FUNCTION array_bitwise_or(
    arr1 BIGINT[],
    arr2 BIGINT[]
)
RETURNS BIGINT[] AS $$
DECLARE
    result BIGINT[] := '{}';
    len INT;
    i INT;
BEGIN
    -- 处理NULL情况
    IF arr1 IS NULL THEN
        RETURN arr2;
    END IF;
    IF arr2 IS NULL THEN
        RETURN arr1;
    END IF;
    
    -- 检查长度
    IF array_length(arr1, 1) != array_length(arr2, 1) THEN
        RAISE EXCEPTION 'Array lengths do not match: % vs %', 
            array_length(arr1, 1), array_length(arr2, 1);
    END IF;
    
    len := array_length(arr1, 1);
    
    FOR i IN 1..len LOOP
        result := array_append(result, arr1[i] | arr2[i]);
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION update_system_email_bitmap_sendcount(
    p_email_id BIGINT DEFAULT NULL,
    p_user_id BIGINT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    res JSON;
    v_bitmap_index INT;
    v_bit_offset INT;
    v_mask BIGINT;
    v_already_claimed BOOLEAN;
    v_type INTEGER;
    v_stuff_json JSON;
BEGIN
    -- 参数检查
    IF p_email_id IS NULL OR p_user_id IS NULL THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
    END IF;
    
    -- 计算位置
    v_bitmap_index := (p_user_id / 64);  -- 数组索引（从0开始）
    v_bit_offset := p_user_id % 64;          -- 位偏移（0-63）
    v_mask := 1::BIGINT << v_bit_offset;     -- 位掩码
    
    -- 检查是否已领取，并锁定行
    SELECT (COALESCE(bitmap[v_bitmap_index], 0) & v_mask) != 0
    INTO v_already_claimed
    FROM system_email_table
    WHERE email_id = p_email_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', '邮件不存在'
        );
    END IF;
    
    IF v_already_claimed IS NULL OR v_already_claimed THEN
        -- 已领取（位为1）或无法确定
        RETURN json_build_object(
            'errorcode', 2,
            'error', '用户已领取或无法处理'
        );
    END IF;
    
    -- 更新位图为1（已领取）
    UPDATE system_email_table
    SET 
        send_count = send_count + 1,
        bitmap[v_bitmap_index] = COALESCE(bitmap[v_bitmap_index], 0) | v_mask
    WHERE email_id = p_email_id
    RETURNING type, stuff_json INTO v_type, v_stuff_json;
    
    -- 返回成功
    RETURN json_build_object(
        'errorcode', 1,
        'error', 'update success',
        'data',json_build_object(
            'type', v_type,
            'stuff_json', v_stuff_json
            )
    );
    
EXCEPTION
    WHEN others THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_system_email_stuff_is_receive(
    p_email_id BIGINT DEFAULT NULL,
    p_user_id BIGINT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    res JSON;
    v_bitmap_index INT;
    v_bit_offset INT;
    v_mask BIGINT;
    v_already_claimed INT;
BEGIN
    -- 参数检查
    IF p_email_id IS NULL OR p_user_id IS NULL THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
    END IF;
    -- 计算位置
    v_bitmap_index := (p_user_id / 64);  -- 数组索引（从0开始）
    v_bit_offset := p_user_id % 64;          -- 位偏移（0-63）
    v_mask := 1::BIGINT << v_bit_offset;     -- 位掩码
    -- 检查是否已领取
    SELECT (COALESCE(bitmap[v_bitmap_index], 0) & v_mask)
    INTO v_already_claimed
    FROM system_email_table
    WHERE email_id = p_email_id;
    IF NOT FOUND THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', '邮件不存在'
        );
    END IF;

    IF v_already_claimed IS NULL THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', '邮件位图数据异常'
        );
    END IF;

    RETURN json_build_object(
        'errorcode', 1,
        'error', 'check success',
        'data', v_already_claimed
    );
EXCEPTION
    WHEN others THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION system_email_bitmap_sync(
    p_email_id BIGINT DEFAULT NULL,
    p_send_count INTEGER DEFAULT NULL,
    p_bitmap BIGINT[] DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
BEGIN
    IF p_email_id IS NULL OR p_send_count IS NULL OR p_bitmap IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
        -- 单条SQL完成更新（需要PostgreSQL 9.5+）
    WITH current_data AS (
        SELECT email_id, bitmap
        FROM system_email_table
        WHERE email_id = p_email_id
        FOR UPDATE
    )
    UPDATE system_email_table s
    SET send_count = p_send_count,
        bitmap = array_bitwise_or(s.bitmap, p_bitmap)
    FROM current_data c
    WHERE s.email_id = c.email_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', 'Email not found'
        );
    END IF;
    
    RETURN json_build_object(
        'errorcode', 1,
        'error', 'Update success'
    );
    
EXCEPTION
    WHEN others THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION receive_system_email_stuff(
    p_email_id BIGINT DEFAULT NULL,
    p_area INTEGER DEFAULT NULL,
    p_userid BIGINT DEFAULT NULL,
    p_coin INTEGER DEFAULT NULL,
    p_diamond INTEGER DEFAULT NULL,
    p_pigcoin INTEGER DEFAULT NULL,
    p_rankpoint INTEGER DEFAULT NULL,
    p_exppoint INTEGER DEFAULT NULL,
    p_s00 INTEGER DEFAULT NULL,
    p_s01 INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    res JSON;
    update_userdata_res JSON;
    update_bitmap_res JSON;
BEGIN
    IF p_email_id IS NULL OR p_area IS NULL OR p_stuff_json IS NULL OR p_userid IS NULL OR p_playername IS NULL THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
    END IF;
    
    update_bitmap_res = update_system_email_bitmap_sendcount(
        p_email_id,
        p_userid);
    IF update_bitmap_res->>'errorcode' != '1' THEN
        RETURN update_bitmap_res;
    END IF;

    update_userdata_res = update_area_player_email(
        p_area,p_userid,
        p_coin,p_diamond,p_pigcoin,
        p_rankpoint,p_exppoint,
        p_s00,p_s01);
    IF update_userdata_res->>'errorcode' = '0' THEN
        RETURN update_userdata_res;
    END IF;


    RETURN json_build_object(
        'errorcode', 1,
        'error', 'Function created successfully'
    );
EXCEPTION
    WHEN others THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION insert_system_email(
    p_keep_days INTEGER DEFAULT NULL,
    p_to_area INTEGER DEFAULT NULL,
    p_email_content TEXT DEFAULT NULL,
    p_all_count INTEGER DEFAULT NULL,
    p_stuff_json JSON DEFAULT NULL,
    p_type INTEGER DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    v_email_id BIGINT;  -- 用于存储返回的自增ID
    res Json;
BEGIN
    IF p_keep_days IS NULL OR p_to_area IS NULL OR p_email_content IS NULL OR p_all_count IS NULL OR p_stuff_json IS NULL OR p_type IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    INSERT INTO system_email_table 
    (create_time, keep_days, to_area, email_content, 
    all_count, send_count, stuff_json, type)
    VALUES 
    (now(), p_keep_days, p_to_area, p_email_content,
     p_all_count, 0, p_stuff_json, p_type)
    RETURNING email_id INTO v_email_id;
    res= json_build_object(
        'errorcode', 1,
        'error', 'insert success',
        'data', v_email_id
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

CREATE OR REPLACE FUNCTION receive_area_player_email_stuff(
    p_email_id BIGINT DEFAULT NULL,
    p_area INTEGER DEFAULT NULL,
    p_userid BIGINT DEFAULT NULL,
    p_coin INTEGER DEFAULT NULL,
    p_diamond INTEGER DEFAULT NULL,
    p_pigcoin INTEGER DEFAULT NULL,
    p_rankpoint INTEGER DEFAULT NULL,
    p_exppoint INTEGER DEFAULT NULL,
    p_s00 INTEGER DEFAULT NULL,
    p_s01 INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    res JSON;
    update_userdata_res JSON;
    update_email_res JSON;
BEGIN
    IF p_email_id IS NULL OR p_area IS NULL OR p_userid IS NULL OR p_playername IS NULL THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
    END IF;

    update_email_res = update_area_player_email_status(
        p_email_id,
        1);
    IF update_email_res->>'errorcode' != '1' THEN
        RETURN update_email_res;
    END IF;

    update_userdata_res = update_area_player_email(
        p_area,p_userid,
        p_coin,p_diamond,p_pigcoin,
        p_rankpoint,p_exppoint,
        p_s00,p_s01);
    IF update_userdata_res->>'errorcode' = '0' THEN
        RETURN update_userdata_res;
    END IF;
    RETURN json_build_object(
        'errorcode', 1,
        'error', 'Function created successfully'
    );
EXCEPTION
    WHEN others THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_area_player_email_status(
    p_email_id BIGINT DEFAULT NULL,
    p_status INTEGER DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
    v_status INTEGER;
BEGIN
    IF p_email_id IS NULL OR p_status IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;

    SELECT status FROM area_player_email_table
    WHERE email_id = p_email_id
    INTO v_status;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'errorcode', 2,
            'error', '邮件不存在'
        );
    END IF;

    IF v_status = p_status THEN
        res= json_build_object(
            'errorcode', 0,
            'error', '邮件已经领取过'
        );
        RETURN res;
    END IF;

    UPDATE area_player_email_table
    SET status = p_status
    WHERE email_id = p_email_id;
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

CREATE OR REPLACE FUNCTION check_area_player_email_stuff_is_receive(
    p_email_id BIGINT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    res JSON;    
        v_status INTEGER;
BEGIN
    IF p_email_id IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    -- 检查是否已领取
    SELECT status
    INTO v_status
    FROM area_player_email_table
    WHERE email_id = p_email_id;
    IF NOT FOUND THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', '邮件不存在'
        );
    END IF;
    RETURN json_build_object(
        'errorcode', 1,
        'error', 'check success',
        'data', v_status
    );
EXCEPTION
    WHEN others THEN
        RETURN json_build_object(
            'errorcode', 0,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_area_player_email(
    p_userid INTEGER DEFAULT NULL,
    p_area INTEGER DEFAULT NULL,
    p_limit_from INTEGER DEFAULT NULL,
    p_limit INTEGER DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
    search_data JSON;
BEGIN
    IF p_userid IS NULL OR p_area IS NULL OR p_limit_from IS NULL OR p_limit_to IS NULL THEN
        res= json_build_object(
            'errorcode', 0,
            'error', 'Missing required fields'
        );
        RETURN res;
    END IF;
    -- 使用 INTO 语句将查询结果存储到 search_data 中
    SELECT json_agg(row_to_json(t))
    INTO search_data
    FROM (
        SELECT *
        FROM area_player_email_table
        WHERE to_userid = p_userid
          AND to_area = p_area
        ORDER BY create_time DESC
        LIMIT p_limit OFFSET p_limit_from
    ) t;
    -- 检查搜索结果是否为空
    IF search_data IS NULL THEN
        search_data := '[]'::JSON;  -- 返回空数组
    END IF;
    res= json_build_object(
        'errorcode', 1,
        'error', 'Function created successfully',
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

CREATE OR REPLACE FUNCTION insert_area_player_email(
    keep_days INTEGER DEFAULT NULL,
    from_userid INTEGER DEFAULT NULL,
    to_userid INTEGER DEFAULT NULL,
    from_playername VARCHAR(100) DEFAULT NULL,
    to_playername VARCHAR(100) DEFAULT NULL,
    from_area INTEGER DEFAULT NULL,
    to_area INTEGER DEFAULT NULL,
    email_content TEXT DEFAULT NULL,
    status INTEGER DEFAULT NULL,
    type INTEGER DEFAULT NULL,
    stuff_json JSON DEFAULT NULL
)
RETURNS Json AS $$
DECLARE
    res Json;
    v_email_id BIGINT;  -- 用于存储返回的自增ID
BEGIN
    INSERT INTO area_player_email_table 
    (create_time, keep_days, from_userid, to_userid, 
    from_playername, to_playername, from_area, to_area, 
    email_content, status, type, stuff_json)
    VALUES 
    (now(), keep_days, from_userid, to_userid,
     from_playername, to_playername, from_area, to_area,
     email_content, status, type, stuff_json)
    RETURNING email_id INTO v_email_id;
    res= json_build_object(
        'errorcode', 1,
        'error', 'insert success',
        'data', v_email_id
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
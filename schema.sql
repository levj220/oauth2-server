--
-- Name: users; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE users (
    id VARCHAR(36) NOT NULL,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(2000) NOT NULL,
    salt VARCHAR(2000) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    PRIMARY KEY (id)
);

--
-- Name: oauth_clients; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE oauth_clients (
  client_id VARCHAR(64) NOT NULL,
  client_secret VARCHAR(64) NOT NULL,
  is_trusted TINYINT(1) NOT NULL,
  redirect_uri TEXT NOT NULL,
  PRIMARY KEY (client_id)
);


--
-- Name: oauth_access_tokens; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE oauth_access_tokens (
  access_token VARCHAR(64) NOT NULL,
  client_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  expires BIGINT UNSIGNED,
  PRIMARY KEY (client_id, user_id),
  FOREIGN KEY (client_id) REFERENCES oauth_clients(client_id),
  FOREIGN KEY (user_id) REFERENCES users(id)  
);

--
-- Name: oauth_refresh_tokens; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE oauth_refresh_tokens (
  refresh_token VARCHAR(64) NOT NULL,
  client_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  expires BIGINT UNSIGNED,
  PRIMARY KEY (client_id, user_id),
  FOREIGN KEY (client_id) REFERENCES oauth_clients(client_id),
  FOREIGN KEY (user_id) REFERENCES users(id)  
);

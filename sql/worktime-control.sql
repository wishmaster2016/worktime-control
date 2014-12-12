-------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
(
  id serial NOT NULL,
  login character varying(255),
  password character varying(255),
  CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

-- ----------------------------
-- Records of answers
-- ----------------------------
INSERT INTO "public"."users" ("login", "password") VALUES ('111111', '222222');

-- ----------------------------
-- Primary Key structure for table answers
-- ----------------------------
ALTER TABLE "public"."answers" ADD PRIMARY KEY ("id");


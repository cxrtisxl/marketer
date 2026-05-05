CREATE TABLE "discoveries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "discoveries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created" timestamp DEFAULT now() NOT NULL,
	"embedding" vector(2048) NOT NULL,
	"original" text NOT NULL
);

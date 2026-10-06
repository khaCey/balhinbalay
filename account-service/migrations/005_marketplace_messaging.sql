-- Additive isolated messaging foundation. No public listings or demo seeds.
CREATE TABLE conversations (
 id uuid PRIMARY KEY,
 listing_id uuid NOT NULL REFERENCES listings ON DELETE RESTRICT,
 initiator_user_id uuid NOT NULL REFERENCES users ON DELETE RESTRICT,
 recipient_user_id uuid NOT NULL REFERENCES users ON DELETE RESTRICT,
 listing_owner_principal_id uuid NOT NULL REFERENCES principals ON DELETE RESTRICT,
 listing_context jsonb NOT NULL CHECK(jsonb_typeof(listing_context)='object'),
 version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz,
 UNIQUE(listing_id,initiator_user_id,recipient_user_id), CHECK(initiator_user_id<>recipient_user_id)
);
CREATE TABLE conversation_participants (
 id uuid PRIMARY KEY, conversation_id uuid NOT NULL REFERENCES conversations ON DELETE RESTRICT,
 user_id uuid NOT NULL REFERENCES users ON DELETE RESTRICT,
 side text NOT NULL CHECK(side IN ('SEEKER','LISTER')), joined_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(conversation_id,user_id), UNIQUE(conversation_id,id), UNIQUE(conversation_id,side)
);
CREATE TABLE messages (
 id uuid PRIMARY KEY, conversation_id uuid NOT NULL REFERENCES conversations ON DELETE RESTRICT,
 sender_participant_id uuid NOT NULL,
 body text NOT NULL CHECK(length(btrim(body))>0 AND length(body)<=2000 AND octet_length(body)<=6000),
 created_at timestamptz NOT NULL DEFAULT now(), client_request_id uuid NOT NULL,
 FOREIGN KEY(conversation_id,sender_participant_id) REFERENCES conversation_participants(conversation_id,id) ON DELETE RESTRICT,
 UNIQUE(sender_participant_id,client_request_id)
);
CREATE INDEX conversation_participant_inbox ON conversation_participants(user_id,conversation_id);
CREATE INDEX conversation_inbox_order ON conversations(created_at DESC,id DESC);
CREATE INDEX message_thread_page ON messages(conversation_id,created_at DESC,id DESC);
CREATE FUNCTION messaging_participant_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE c conversations; target uuid;
BEGIN
 IF TG_TABLE_NAME='conversations' THEN target := NEW.id; ELSE target := NEW.conversation_id; END IF;
 SELECT * INTO c FROM conversations WHERE id=target;
 IF (SELECT count(*) FROM conversation_participants WHERE conversation_id=target)<>2
 OR NOT EXISTS(SELECT 1 FROM conversation_participants WHERE conversation_id=target AND side='SEEKER' AND user_id=c.initiator_user_id)
 OR NOT EXISTS(SELECT 1 FROM conversation_participants WHERE conversation_id=target AND side='LISTER' AND user_id=c.recipient_user_id)
 THEN RAISE EXCEPTION 'Conversation requires its two original participants' USING ERRCODE='23514'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER conversation_two_participants AFTER INSERT ON conversations
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION messaging_participant_integrity();
CREATE CONSTRAINT TRIGGER conversation_participant_mapping AFTER INSERT ON conversation_participants
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION messaging_participant_integrity();
CREATE FUNCTION messaging_context_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF (NEW.id,NEW.listing_id,NEW.initiator_user_id,NEW.recipient_user_id,NEW.listing_owner_principal_id,NEW.listing_context,NEW.created_at)
 IS DISTINCT FROM (OLD.id,OLD.listing_id,OLD.initiator_user_id,OLD.recipient_user_id,OLD.listing_owner_principal_id,OLD.listing_context,OLD.created_at)
 THEN RAISE EXCEPTION 'Conversation identity/context is immutable' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER conversation_context_immutable BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION messaging_context_immutable();
CREATE TRIGGER conversation_no_delete BEFORE DELETE ON conversations FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();
CREATE TRIGGER participants_immutable BEFORE UPDATE OR DELETE ON conversation_participants FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();
CREATE TRIGGER messages_immutable BEFORE UPDATE OR DELETE ON messages FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();

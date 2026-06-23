
DROP POLICY "Anyone can submit a contact message" ON public.contact_messages;

CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) > 0
    AND char_length(email) > 2
    AND char_length(subject) > 0
    AND char_length(message) > 0
  );

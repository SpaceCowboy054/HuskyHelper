-- & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost
-- CREATE TABLE subjects(
--     subject_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     name text NOT NULL,
--     abbreviation text NOT NULL
-- );

-- -- ["subject name", "course name", "catalog number", "credits", "term", "description", "enrollment requirements", "quantatative", "writing", 
-- -- "CA1", "CA2", "CA3", "CA4", "CA4INT", "TOI1", "TOI2", "TOI3", "TOI4", "TOI5", "TOI6"]
-- CREATE TABLE courses(
--     course_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY
--     subject_id int REFERENCES subjects(subject_id),    -- foreign key

-- );

-- DROP TABLE subjects;
-- DROP TABLE courses;

-- CREATE TABLE subjects(
--     subject_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     name text NOT NULL,
--     abbreviation text NOT NULL
-- );

-- -- file path has to be absolute
-- copy subjects (name, abbreviation) from '\Users\andre\OneDrive\Desktop\Scheduling Project\subjects.csv'
-- delimiter ',' header csv;


-- CREATE TABLE courses(
--     course_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     course_name text,
--     subject_id int REFERENCES subjects(subject_id),
--     catalog_number text,
--     credits text,
--     term text,
--     description text,
--     enrollment_requirements text,
--     quantatative boolean,
--     writing boolean,
--     CA1 boolean,
--     CA2 boolean,
--     CA3 boolean,
--     CA4 boolean,
--     CA4INT boolean,
--     TOI1 boolean,
--     TOI2 boolean,
--     TOI3 boolean,
--     TOI4 boolean,
--     TOI5 boolean,
--     TOI6 boolean
-- );

-- CREATE TABLE staging_courses(
--     course_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     course_name text,
--     subject_name text,
--     catalog_number text,
--     credits text,
--     term text,
--     description text,
--     enrollment_requirements text,
--     quantatative boolean,
--     writing boolean,
--     CA1 boolean,
--     CA2 boolean,
--     CA3 boolean,
--     CA4 boolean,
--     CA4INT boolean,
--     TOI1 boolean,
--     TOI2 boolean,
--     TOI3 boolean,
--     TOI4 boolean,
--     TOI5 boolean,
--     TOI6 boolean
-- );

-- ALTER TABLE courses
-- ALTER COLUMN credits TYPE text;

-- ALTER TABLE staging_courses
-- ALTER COLUMN credits TYPE text;

-- SET CLIENT_ENCODING TO 'utf8';

-- copy subjects (name, abbreviation) from '\Users\andre\OneDrive\Desktop\Scheduling Project\subjects.csv'
-- delimiter ',' header csv;

-- copy staging_courses (subject_name, course_name,catalog_number,credits,term,description,enrollment_requirements,quantatative,writing,CA1,CA2,CA3,CA4,CA4INT,TOI1,TOI2,TOI3,TOI4,TOI5,TOI6) from '\Users\andre\OneDrive\Desktop\Scheduling Project\courses.csv'
-- delimiter ',' header csv;

-- INSERT INTO courses (subject_id, course_name,catalog_number,credits,term,description,enrollment_requirements,quantatative,writing,CA1,CA2,CA3,CA4,CA4INT,TOI1,TOI2,TOI3,TOI4,TOI5,TOI6)
-- SELECT s.subject_id, c.course_name, c.catalog_number, c.credits, c.term, c.description, c.enrollment_requirements, c.quantatative, c.writing, c.CA1, c.CA2, c.CA3, c.CA4, c.CA4INT, c.TOI1, c.TOI2, c.TOI3, c.TOI4, c.TOI5, c.TOI6
-- FROM staging_courses c
-- JOIN subjects s ON s.name = c.subject_name;

-- SELECT * FROM courses

-- DELETE FROM subjects a
-- USING subjects b
-- WHERE a.name = b.name
--   AND a.subject_id > b.subject_id;

-- DROP TABLE subjects;

-- CREATE TABLE staging_sections(
--     section_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     course_name text,
--     section_number text,
--     instructor text,
--     campus text,
--     meeting_time text,
--     instruction_mode text,
--     required_additional_sections text,
--     current_enrollment text,
--     max_enrollment text,
--     seats_available text,
--     reserved_seats_info text,
--     waitlist_available_seats text
-- );


-- CREATE TABLE sections(
--     section_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     course_id int REFERENCES courses(course_id),
--     section_number text,
--     instructor text,
--     campus text,
--     meeting_time text,
--     instruction_mode text,
--     required_additional_sections text,
--     current_enrollment text,
--     max_enrollment text,
--     seats_available text,
--     reserved_seats_info text,
--     waitlist_available_seats text
-- );

-- copy staging_sections (course_name,section_number,instructor,campus,meeting_time,instruction_mode,required_additional_sections,current_enrollment,max_enrollment,seats_available,reserved_seats_info,waitlist_available_seats) 
-- from '\Users\andre\OneDrive\Desktop\Scheduling Project\sections.csv'
-- delimiter ',' header csv;

-- INSERT INTO sections (course_id,section_number,instructor,campus,meeting_time,instruction_mode,required_additional_sections,current_enrollment,max_enrollment,seats_available,reserved_seats_info,waitlist_available_seats)
-- SELECT c.course_id, ss.section_number, ss.instructor, ss.campus, ss.meeting_time, ss.instruction_mode, ss.required_additional_sections, ss.current_enrollment, ss.max_enrollment, ss.seats_available, ss.reserved_seats_info, ss.waitlist_available_seats
-- FROM staging_sections ss
-- JOIN courses c ON c.course_name = ss.course_name;

-- DELETE FROM courses a
-- USING courses b
-- WHERE a.course_name = b.course_name
--   AND a.catalog_number = b.catalog_number
--   AND a.subject_id = b.subject_id
--   AND a.course_id > b.course_id;

-- ALTER TABLE courses
-- ADD COLUMN environmental BOOLEAN;

-- UPDATE courses
-- SET environmental = FALSE
-- WHERE environmental IS NULL;

-- UPDATE courses
-- SET environmental = TRUE
-- WHERE catalog_number LIKE '%E';

-- SELECT * FROM sections WHERE "section_number" like '%001%' AND "instructor" like 'E. Cooper Owens' LIMIT 100 OFFSET 100 
DELETE FROM sections a
USING sections b
WHERE a.section_id > b.section_id
  AND a.course_id = b.course_id
  AND TRIM(a.section_number) = TRIM(b.section_number);

SELECT * FROM sections WHERE "section_number" like '%001%' AND "instructor" like '%E. Cooper Owens%' LIMIT 100
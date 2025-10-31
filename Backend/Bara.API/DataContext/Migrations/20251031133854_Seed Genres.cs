using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Bara.API.DataContext.Migrations
{
    /// <inheritdoc />
    public partial class SeedGenres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Genres",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("071122f9-bab6-4539-999c-02ca377a0c39"), "Epic tales combining magic, myth, and heroic journeys.", "Fantasy Adventure" },
                    { new Guid("0933c41c-9096-40ff-8cd6-79208ce9cb0d"), "Stories set in or inspired by real historical periods and events.", "Historical" },
                    { new Guid("0a03d8ad-5f25-4aa3-a0ef-07c9a3aca523"), "Stories depicting conflict, survival, and humanity in wartime.", "War" },
                    { new Guid("28b37360-0191-438f-a1b9-5d5d96fdaee0"), "Stories focused on criminal activity, law enforcement, and justice.", "Crime" },
                    { new Guid("29064b32-69a1-4faa-9747-bd2752f62f86"), "Stories designed to scare, shock, or unsettle through fear or tension.", "Horror" },
                    { new Guid("34ce6848-edd4-49ab-a3b9-e2f1308bb089"), "Stories featuring journeys, exploration, and daring experiences.", "Adventure" },
                    { new Guid("35508755-0754-4e11-b67e-b6bff6945225"), "Stories told through stylized or artistic animation.", "Animation" },
                    { new Guid("3a8b3f68-d659-4e02-8f85-446d55acf787"), "Narratives where song and performance drive the story.", "Musical" },
                    { new Guid("3f6e08e0-f550-4815-b173-5dbb8b4fb04b"), "Stories set in imaginary worlds with magic, myths, or supernatural elements.", "Fantasy" },
                    { new Guid("3ffdb743-ab8e-423b-a367-07540912483a"), "Dramatized portrayals of real-life people and their experiences.", "Biopic" },
                    { new Guid("497e4746-cea3-40b5-8edb-0924f9518790"), "Love stories blended with humor and lighthearted tension.", "Romantic Comedy" },
                    { new Guid("50b1f500-b822-4795-a647-237071570506"), "Character-driven stories exploring emotion, conflict, and realism.", "Drama" },
                    { new Guid("50cf5b26-8b03-46d1-8afe-2c279290f2df"), "High-paced stories with physical feats, chases, and intense conflict.", "Action" },
                    { new Guid("554c737c-904d-4393-8dfe-f90dd16a0259"), "Stories about growth, identity, and the transition into adulthood.", "Coming-of-Age" },
                    { new Guid("57ffa4c7-cd13-43db-b5e1-05e54a75b546"), "Stylized stories featuring cynicism, fatalism, and moral ambiguity.", "Noir" },
                    { new Guid("5a627f27-2a5f-4960-a413-38ca10d755f4"), "Stories suitable for all ages, often with heartwarming or moral themes.", "Family" },
                    { new Guid("62750cca-0e00-4a08-9dd3-5315cde679f6"), "Stories about extraordinary individuals balancing power and morality.", "Superhero" },
                    { new Guid("77dbde66-5fa7-4d98-af36-228b2786ad7e"), "Non-fictional storytelling capturing real-life events or people.", "Documentary" },
                    { new Guid("810c36ef-a745-4814-ad35-6fe2d37ff016"), "Stories focusing on love, relationships, and emotional intimacy.", "Romance" },
                    { new Guid("849e7722-9601-4500-8c46-eb6a46c5bef9"), "Stories exploring the mind, identity, or emotional instability.", "Psychological" },
                    { new Guid("8f06f94d-93e7-4b7f-994c-69dd21598daa"), "Real-world settings infused with subtle magical or surreal elements.", "Mystical Realism" },
                    { new Guid("92f3dad1-cd8a-4a8f-ae7a-102622f45c09"), "Stories revolving around governance, ideology, and corruption.", "Political" },
                    { new Guid("9b2bc460-a66f-4b33-a64e-d4da38019ca7"), "Light-hearted stories that aim to entertain and amuse audiences.", "Comedy" },
                    { new Guid("ba9ec5ac-6687-4d78-942b-5ee5decf57d2"), "Stories centered on athletes, competition, and perseverance.", "Sports" },
                    { new Guid("bc9c314b-f722-470f-9c8a-ae4734c2db13"), "Futuristic dystopias mixing tech, rebellion, and moral decay.", "Cyberpunk" },
                    { new Guid("c606dd88-4247-4269-9173-febb324fe009"), "Stories set after civilization’s fall, exploring survival and renewal.", "Post-Apocalyptic" },
                    { new Guid("c9728af9-1af2-4c13-9d52-c6aa2a9e9615"), "Stories inspired by spiritual, moral, or religious themes.", "Faith-Based" },
                    { new Guid("d48502d1-5352-48bc-8c31-b5d871b08616"), "Stories centered on solving puzzles, crimes, or hidden truths.", "Mystery" },
                    { new Guid("d65a27f8-7f63-4cfb-81d0-43c1fa5324ce"), "Stories addressing social issues, justice, and cultural reflection.", "Social Commentary" },
                    { new Guid("da3e94e0-1616-4243-b2a1-e639c4b8a453"), "Humor that emerges from tragedy, irony, or moral ambiguity.", "Dark Comedy" },
                    { new Guid("fbe411b8-aafd-4143-a6be-3c6dea52a340"), "Suspenseful stories that build tension and keep viewers on edge.", "Thriller" },
                    { new Guid("fc8073ac-220c-42c1-8c06-5e81674e41ff"), "Non-traditional or avant-garde narratives pushing boundaries.", "Experimental" },
                    { new Guid("fe63fe82-dac2-4025-8f03-89555063d605"), "Stories exploring futuristic technology, space, and speculative ideas.", "Science Fiction" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("071122f9-bab6-4539-999c-02ca377a0c39"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("0933c41c-9096-40ff-8cd6-79208ce9cb0d"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("0a03d8ad-5f25-4aa3-a0ef-07c9a3aca523"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("28b37360-0191-438f-a1b9-5d5d96fdaee0"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("29064b32-69a1-4faa-9747-bd2752f62f86"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("34ce6848-edd4-49ab-a3b9-e2f1308bb089"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("35508755-0754-4e11-b67e-b6bff6945225"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("3a8b3f68-d659-4e02-8f85-446d55acf787"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("3f6e08e0-f550-4815-b173-5dbb8b4fb04b"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("3ffdb743-ab8e-423b-a367-07540912483a"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("497e4746-cea3-40b5-8edb-0924f9518790"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("50b1f500-b822-4795-a647-237071570506"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("50cf5b26-8b03-46d1-8afe-2c279290f2df"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("554c737c-904d-4393-8dfe-f90dd16a0259"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("57ffa4c7-cd13-43db-b5e1-05e54a75b546"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("5a627f27-2a5f-4960-a413-38ca10d755f4"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("62750cca-0e00-4a08-9dd3-5315cde679f6"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("77dbde66-5fa7-4d98-af36-228b2786ad7e"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("810c36ef-a745-4814-ad35-6fe2d37ff016"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("849e7722-9601-4500-8c46-eb6a46c5bef9"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("8f06f94d-93e7-4b7f-994c-69dd21598daa"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("92f3dad1-cd8a-4a8f-ae7a-102622f45c09"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("9b2bc460-a66f-4b33-a64e-d4da38019ca7"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("ba9ec5ac-6687-4d78-942b-5ee5decf57d2"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("bc9c314b-f722-470f-9c8a-ae4734c2db13"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("c606dd88-4247-4269-9173-febb324fe009"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("c9728af9-1af2-4c13-9d52-c6aa2a9e9615"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("d48502d1-5352-48bc-8c31-b5d871b08616"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("d65a27f8-7f63-4cfb-81d0-43c1fa5324ce"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("da3e94e0-1616-4243-b2a1-e639c4b8a453"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("fbe411b8-aafd-4143-a6be-3c6dea52a340"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("fc8073ac-220c-42c1-8c06-5e81674e41ff"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("fe63fe82-dac2-4025-8f03-89555063d605"));
        }
    }
}

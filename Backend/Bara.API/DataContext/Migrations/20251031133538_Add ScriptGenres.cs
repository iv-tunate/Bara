using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Bara.API.DataContext.Migrations
{
    /// <inheritdoc />
    public partial class AddScriptGenres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Genres_Scripts_ScriptId",
                table: "Genres");

            migrationBuilder.DropIndex(
                name: "IX_Genres_ScriptId",
                table: "Genres");

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("05ddf28e-27fe-4cdd-a455-04492f034cf1"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("0d89a7ae-59a5-469e-b58c-e19f55176f81"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("1f2f40a3-7650-4588-88c7-8dcbeac2e8c2"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("365108ad-5700-4eac-922f-b4f8e0718f18"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("499fd84c-21ac-47c1-a36e-dabd89095bd1"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("4b39daa3-0ce9-4ff6-8947-f9f5ebc155db"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("4bbe1b04-8b6a-4eb9-a973-c1f9e1b9766c"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("4d8e0058-c068-4082-afbe-5218e38818b3"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("502c1f81-1409-4650-874f-82129b5c78fa"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("5307ea4f-4a38-4a8e-8dc2-4341333200cf"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("54cf7257-e6ac-4a3f-a12c-a84baf9ccadd"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("6d5ee5cb-b2eb-4ef5-b28f-b67655d07d57"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("7d2e8dd5-a9fa-4c2d-9e29-ceedc22dd292"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("7eacd184-1c51-4c7a-8d23-ea9fd4055baf"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("7ef84244-b5b9-45df-abb3-a94ffe228032"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("8914e52d-3fb2-45dd-9b83-6594642912de"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("9669cd2b-f528-4b44-a593-28a532d643e7"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("9757f446-aecc-4c71-a108-a66461b8d3f3"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("9bd42e1f-a91b-44e8-92e1-c4e74e9caf38"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("acf19b34-b5e8-4b38-afa9-f2f7e3304345"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("ba04d138-837c-43ee-82ae-ad6811cc7b25"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("bd1e9340-d74a-44e5-ac46-fde205c21d96"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("be73583d-c37a-49ca-837a-298ed3123e5a"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("c9293445-a881-4719-908a-3c396cfbcbe4"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("caae8c5a-c573-417f-9c11-ef4a3dba9cf5"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("cdcba66a-ad75-4187-adaa-c19bf1359dc9"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("d1e0d885-ce96-47de-90c6-181a7b0510b4"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("d9027750-a0ee-49aa-b98b-e2d079da6247"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("e41616bf-18c9-42e6-9333-51ec92f6f313"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("eb7f1182-eb96-4ad4-b2d1-1c2dc0fdff79"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("eb925179-e538-47fa-92f9-d18e96c781e0"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("ee52f229-4646-4320-96d8-c18ab64efea7"));

            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: new Guid("ff8f9eea-69cc-41ed-a59f-604a716c68eb"));

            migrationBuilder.DropColumn(
                name: "ScriptId",
                table: "Genres");

            migrationBuilder.CreateTable(
                name: "ScriptGenres",
                columns: table => new
                {
                    GenresId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScriptsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScriptGenres", x => new { x.GenresId, x.ScriptsId });
                    table.ForeignKey(
                        name: "FK_ScriptGenres_Genres_GenresId",
                        column: x => x.GenresId,
                        principalTable: "Genres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScriptGenres_Scripts_ScriptsId",
                        column: x => x.ScriptsId,
                        principalTable: "Scripts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScriptGenres_ScriptsId",
                table: "ScriptGenres",
                column: "ScriptsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScriptGenres");

            migrationBuilder.AddColumn<Guid>(
                name: "ScriptId",
                table: "Genres",
                type: "uuid",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Genres",
                columns: new[] { "Id", "Description", "Name", "ScriptId" },
                values: new object[,]
                {
                    { new Guid("05ddf28e-27fe-4cdd-a455-04492f034cf1"), "Stories set in imaginary worlds with magic, myths, or supernatural elements.", "Fantasy", null },
                    { new Guid("0d89a7ae-59a5-469e-b58c-e19f55176f81"), "High-paced stories with physical feats, chases, and intense conflict.", "Action", null },
                    { new Guid("1f2f40a3-7650-4588-88c7-8dcbeac2e8c2"), "Stories inspired by spiritual, moral, or religious themes.", "Faith-Based", null },
                    { new Guid("365108ad-5700-4eac-922f-b4f8e0718f18"), "Stories exploring futuristic technology, space, and speculative ideas.", "Science Fiction", null },
                    { new Guid("499fd84c-21ac-47c1-a36e-dabd89095bd1"), "Epic tales combining magic, myth, and heroic journeys.", "Fantasy Adventure", null },
                    { new Guid("4b39daa3-0ce9-4ff6-8947-f9f5ebc155db"), "Stories about extraordinary individuals balancing power and morality.", "Superhero", null },
                    { new Guid("4bbe1b04-8b6a-4eb9-a973-c1f9e1b9766c"), "Humor that emerges from tragedy, irony, or moral ambiguity.", "Dark Comedy", null },
                    { new Guid("4d8e0058-c068-4082-afbe-5218e38818b3"), "Stylized stories featuring cynicism, fatalism, and moral ambiguity.", "Noir", null },
                    { new Guid("502c1f81-1409-4650-874f-82129b5c78fa"), "Real-world settings infused with subtle magical or surreal elements.", "Mystical Realism", null },
                    { new Guid("5307ea4f-4a38-4a8e-8dc2-4341333200cf"), "Stories about growth, identity, and the transition into adulthood.", "Coming-of-Age", null },
                    { new Guid("54cf7257-e6ac-4a3f-a12c-a84baf9ccadd"), "Dramatized portrayals of real-life people and their experiences.", "Biopic", null },
                    { new Guid("6d5ee5cb-b2eb-4ef5-b28f-b67655d07d57"), "Stories designed to scare, shock, or unsettle through fear or tension.", "Horror", null },
                    { new Guid("7d2e8dd5-a9fa-4c2d-9e29-ceedc22dd292"), "Stories focused on criminal activity, law enforcement, and justice.", "Crime", null },
                    { new Guid("7eacd184-1c51-4c7a-8d23-ea9fd4055baf"), "Stories revolving around governance, ideology, and corruption.", "Political", null },
                    { new Guid("7ef84244-b5b9-45df-abb3-a94ffe228032"), "Stories depicting conflict, survival, and humanity in wartime.", "War", null },
                    { new Guid("8914e52d-3fb2-45dd-9b83-6594642912de"), "Stories suitable for all ages, often with heartwarming or moral themes.", "Family", null },
                    { new Guid("9669cd2b-f528-4b44-a593-28a532d643e7"), "Stories centered on athletes, competition, and perseverance.", "Sports", null },
                    { new Guid("9757f446-aecc-4c71-a108-a66461b8d3f3"), "Non-traditional or avant-garde narratives pushing boundaries.", "Experimental", null },
                    { new Guid("9bd42e1f-a91b-44e8-92e1-c4e74e9caf38"), "Love stories blended with humor and lighthearted tension.", "Romantic Comedy", null },
                    { new Guid("acf19b34-b5e8-4b38-afa9-f2f7e3304345"), "Narratives where song and performance drive the story.", "Musical", null },
                    { new Guid("ba04d138-837c-43ee-82ae-ad6811cc7b25"), "Stories focusing on love, relationships, and emotional intimacy.", "Romance", null },
                    { new Guid("bd1e9340-d74a-44e5-ac46-fde205c21d96"), "Non-fictional storytelling capturing real-life events or people.", "Documentary", null },
                    { new Guid("be73583d-c37a-49ca-837a-298ed3123e5a"), "Stories featuring journeys, exploration, and daring experiences.", "Adventure", null },
                    { new Guid("c9293445-a881-4719-908a-3c396cfbcbe4"), "Stories addressing social issues, justice, and cultural reflection.", "Social Commentary", null },
                    { new Guid("caae8c5a-c573-417f-9c11-ef4a3dba9cf5"), "Stories exploring the mind, identity, or emotional instability.", "Psychological", null },
                    { new Guid("cdcba66a-ad75-4187-adaa-c19bf1359dc9"), "Light-hearted stories that aim to entertain and amuse audiences.", "Comedy", null },
                    { new Guid("d1e0d885-ce96-47de-90c6-181a7b0510b4"), "Character-driven stories exploring emotion, conflict, and realism.", "Drama", null },
                    { new Guid("d9027750-a0ee-49aa-b98b-e2d079da6247"), "Stories set after civilization’s fall, exploring survival and renewal.", "Post-Apocalyptic", null },
                    { new Guid("e41616bf-18c9-42e6-9333-51ec92f6f313"), "Stories told through stylized or artistic animation.", "Animation", null },
                    { new Guid("eb7f1182-eb96-4ad4-b2d1-1c2dc0fdff79"), "Suspenseful stories that build tension and keep viewers on edge.", "Thriller", null },
                    { new Guid("eb925179-e538-47fa-92f9-d18e96c781e0"), "Stories set in or inspired by real historical periods and events.", "Historical", null },
                    { new Guid("ee52f229-4646-4320-96d8-c18ab64efea7"), "Stories centered on solving puzzles, crimes, or hidden truths.", "Mystery", null },
                    { new Guid("ff8f9eea-69cc-41ed-a59f-604a716c68eb"), "Futuristic dystopias mixing tech, rebellion, and moral decay.", "Cyberpunk", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Genres_ScriptId",
                table: "Genres",
                column: "ScriptId");

            migrationBuilder.AddForeignKey(
                name: "FK_Genres_Scripts_ScriptId",
                table: "Genres",
                column: "ScriptId",
                principalTable: "Scripts",
                principalColumn: "Id");
        }
    }
}

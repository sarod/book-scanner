import { describe, test, expect } from "vitest";
import { isDecalogCSV, parseDecalogCsv } from "./parseDecalogCsv";

describe("parseDecalogCsv", () => {
  test("should correctly identify Decalog CSV headers", () => {
    const validHeaders = ["État", "Titre du document", "Informations"];
    expect(isDecalogCSV(validHeaders)).toBe(true);

    const invalidHeaders = ["Status", "Title", "Info"];
    expect(isDecalogCSV(invalidHeaders)).toBe(false);

    const wrongLength = ["État", "Titre du document"];
    expect(isDecalogCSV(wrongLength)).toBe(false);
  });

  test("should parse the provided Decalog CSV data correctly", () => {
    const headers = ["État", "Titre du document", "Informations"];

    // Rows as they would be parsed by papaparse (split on commas, no escaping), trimmed
    const rows = [
      [
        "En cours",
        "Sorceline (6) : Mystère et boule de gnome ! par Sylvia Douyé Publié par Vents d'Ouest",
        "DL 2023",
        "Prêté le 29/10/2025 par Lentilly Retour prévu le 19/11/2025",
      ],
      [
        "En cours",
        "Sorceline (5) : Le saigneur de Vorn par Sylvia Douyé Publié par Vents d'Ouest",
        "2022",
        "Prêté le 29/10/2025 par Médiathèque de L'Arbresle Retour prévu le 19/11/2025",
      ],
      [
        "En cours",
        "Lightfall (2) : L'ombre de l'oiseau par Tim Probert Publié par Gallimard bande dessinée",
        "DL 2022",
        "Prêté le 29/10/2025 par Lentilly Retour prévu le 19/11/2025",
      ],
      [
        "En retard",
        "La Revue dessinée n°46 Hiver 2024/2025 : Accouchement : poussées à bout Publié en 2024",
        "Prêté le 07/10/2025 par Lentilly Retour prévu le 28/10/2025",
      ],
      [
        "En retard",
        "Brussailes par Eléonore Devillepoix Publié par Hachette romans",
        "DL 2022",
        "Prêté le 07/10/2025 par Lentilly Retour prévu le 28/10/2025 Ce document est réservé par un autre usager.",
      ],
    ];

    const result = parseDecalogCsv(headers, rows);

    expect(result).toEqual([
      {
        title: "Sorceline (6) : Mystère et boule de gnome !",
        authors: ["Sylvia Douyé"],
        overdue: false,
        returnDate: "2025-11-19",
      },
      {
        title: "Sorceline (5) : Le saigneur de Vorn",
        authors: ["Sylvia Douyé"],
        overdue: false,
        returnDate: "2025-11-19",
      },
      {
        title: "Lightfall (2) : L'ombre de l'oiseau",
        authors: ["Tim Probert"],
        overdue: false,
        returnDate: "2025-11-19",
      },
      {
        title:
          "La Revue dessinée n°46 Hiver 2024/2025 : Accouchement : poussées à bout",
        authors: [],
        overdue: true,
        returnDate: "2025-10-28",
      },
      {
        title: "Brussailes",
        authors: ["Eléonore Devillepoix"],
        overdue: true,
        returnDate: "2025-10-28",
      },
    ]);
  });

  test("should throw error for invalid headers", () => {
    const invalidHeaders = ["Status", "Title", "Info"];
    const rows = [["En cours", "Title", "Info"]];

    expect(() => parseDecalogCsv(invalidHeaders, rows)).toThrow(
      "Not a decalog CSV"
    );
  });

  test("should filter out books with empty titles", () => {
    const headers = ["État", "Titre du document", "Informations"];
    const rows = [
      ["En cours", "", "Info"],
      ["En cours", "Valid Title", "Info"],
    ];

    const result = parseDecalogCsv(headers, rows);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Valid Title");
  });
});

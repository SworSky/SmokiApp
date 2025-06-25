# Smoki - Gra Karciana 🐉

Aplikacja mobilna na React Native (Expo) do pomocy w grze w karty "Smoki". Aplikacja oferuje kolorowy, przyjazny dzieciom interfejs z motywem smoków i obsługuje zarządzanie graczami, punktowanie oraz statystyki.

## Funkcje

### 🎮 Główne funkcje
- **Nowa Gra**: Wybierz graczy, ustaw kolejność i zacznij grę
- **Zarządzanie Graczami**: Dodaj, edytuj i usuń graczy z bazy danych
- **System Punktów**: Łatwe wprowadzanie punktów z automatycznym obliczaniem sum
- **Automatyczne Zakończenie**: Gra kończy się gdy gracz osiągnie 101+ punktów
- **Ranking**: System miejsc (1., 2., 3.) z emoji nagród

### 📊 Statystyki i Dane
- **Statystyki Graczy**: Liczba gier, ilość 1., 2. i 3. miejsc
- **Zapis Stanu Gry**: Automatyczny zapis w przypadku zamknięcia aplikacji
- **Historia Rund**: Śledzenie postępu gry runda po rundzie
- **Baza Danych SQLite**: Trwałe przechowywanie danych graczy i gier

### 🎨 Interfejs
- **Kolorowy Design**: Przyjazny dzieciom interfejs z motywem smoków
- **Polski Język**: Cały interfejs w języku polskim
- **Gradientowe Tła**: Piękne kolory z motywem smoczym
- **Responsywny**: Dostosowany do różnych rozmiarów ekranów

## Instalacja i Uruchomienie

### Wymagania
- Node.js (v16 lub nowszy)
- Expo CLI
- iOS Simulator (dla iOS) lub Android Emulator/urządzenie (dla Android)

### Kroki instalacji

1. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

2. **Uruchom aplikację:**
   ```bash
   npm start
   ```

3. **Wybierz platformę:**
   - Naciśnij `i` dla iOS Simulator
   - Naciśnij `a` dla Android Emulator
   - Zeskanuj kod QR w aplikacji Expo Go na swoim urządzeniu

## Struktura Projektu

```
SmokiApp/
├── src/
│   ├── screens/          # Ekrany aplikacji
│   │   ├── MainMenuScreen.js
│   │   ├── PlayersScreen.js
│   │   ├── PlayerSelectionScreen.js
│   │   ├── PlayerOrderScreen.js
│   │   └── GameScreen.js
│   ├── services/         # Usługi i logika biznesowa
│   │   ├── database.js   # Operacje SQLite
│   │   └── gameService.js # Logika gry i stan
│   └── styles/           # Style i kolory
│       └── globalStyles.js
├── assets/               # Zasoby (ikony, obrazy)
├── App.js               # Główny komponent aplikacji
└── package.json         # Zależności i skrypty
```

## Schemat Bazy Danych

### Tabela `players`
- `id` - klucz główny
- `name` - imię gracza (unikalne)
- `totalGames` - całkowita liczba gier
- `firstPlace` - liczba pierwszych miejsc
- `secondPlace` - liczba drugich miejsc  
- `thirdPlace` - liczba trzecich miejsc

### Tabela `games`
- `id` - klucz główny
- `players` - JSON z listą graczy
- `currentState` - JSON ze stanem gry
- `isCompleted` - czy gra została zakończona
- `createdAt` - data utworzenia

### Tabela `gameRounds`
- `id` - klucz główny
- `gameId` - odniesienie do gry
- `roundNumber` - numer rundy
- `playerScores` - JSON z punktami graczy

## Przepływ Gry

1. **Menu Główne**: Wybór "Nowa Gra" lub "Gracze"
2. **Zarządzanie Graczami**: Dodawanie/edycja graczy (opcjonalne)
3. **Wybór Graczy**: Wybór 2-6 graczy do gry
4. **Kolejność Graczy**: Ustalenie/losowanie kolejności
5. **Rozgrywka**: 
   - Wprowadzanie punktów dla każdego gracza w rundzie
   - Automatyczne obliczanie sum i miejsc
   - Możliwość cofnięcia poprzedniego gracza/rundy
6. **Koniec Gry**: Gdy gracz osiągnie 101+ punktów
7. **Wyniki**: Wyświetlenie końcowych wyników i aktualizacja statystyk

## Technologie

- **React Native** - Framework do aplikacji mobilnych
- **Expo** - Platforma developmentowa i narzędzia
- **React Navigation** - Nawigacja między ekranami
- **Expo SQLite** - Lokalna baza danych
- **Expo Linear Gradient** - Gradientowe tła
- **AsyncStorage** - Przechowywanie stanu gry

## Rozwój

Aplikacja jest gotowa do użytku, ale można ją rozszerzyć o:
- Eksport/import danych graczy
- Bardziej zaawansowane statystyki
- Tryby gry (różne limity punktów)
- Motywy kolorystyczne
- Dźwięki i animacje
- Multiplayer online

## Licencja

Ten projekt jest stworzony do użytku prywatnego.

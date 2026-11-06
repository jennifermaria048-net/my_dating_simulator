
import java.util.Scanner;

public class Story
{
    String name;
    Scanner sc;
    GameCharacter gabriel;

    Story(String playerName, Scanner scanner, GameCharacter character)
    {
        name = playerName;
        sc = scanner;
        gabriel = character;
    }

    void pause()
    {
        System.out.println("\n[Press ENTER to continue]");
        sc.nextLine();
    }

    void dialogue(String character, String message)
    {
        System.out.println("\n" + character + ": " + message);
        pause();
    }

    void narration(String message)
    {
        System.out.println("\n" + message);
        pause();
    }

    void chapter1()
    {
        System.out.println("\n===== CHAPTER 1: THE UNIVERSITY CRUSH =====");
        narration("The university campus was filled with students.");
        narration("You walked towards your classroom.");
        narration("And then, you saw " + gabriel.fullName + ".");
        dialogue(name, "There's my " + gabriel.nickname + "...");
        narration("You smiled, hoping he would notice you.");
    }

    void chapter2()
    {
        System.out.println("\n===== CHAPTER 2: CHILDHOOD MEMORIES =====");
        narration("An old memory suddenly came back to you.");
        narration("You remembered running around with " + gabriel.fullName + " as children.");
        narration("You shared toys, secrets and countless memories.");
        dialogue(name, "We've really known each other forever...");
    }

    void chapter3()
    {
        System.out.println("\n===== CHAPTER 3: SOMETHING MORE =====");
        narration("Days passed, and you started spending more time together.");
        dialogue(gabriel.fullName, "I'm really glad we found each other again.");
        dialogue(name, "Me too, " + gabriel.nickname + ".");
        narration("You slowly realised that your feelings were becoming stronger.");
    }

    void chapter4()
    {
        System.out.println("\n===== CHAPTER 4: THE BEACH =====");
        narration("The evening sky slowly turned dark.");
        narration("You and " + gabriel.fullName + " arrived at a quiet beach.");
        narration("The moonlight reflected across the ocean.");
        dialogue(gabriel.fullName, "It's beautiful tonight, isn't it?");
        dialogue(name, "It really is.");
    }

    void chapter5()
    {
        System.out.println("\n===== CHAPTER 5: UNDER THE MOONLIGHT =====");
        dialogue(name, gabriel.nickname + ", can I tell you something?");
        dialogue(gabriel.fullName, "Of course. I'm listening.");
        dialogue(name, "I've liked you for a really long time.");
        dialogue(name, "You became someone I never wanted to lose.");
        dialogue(gabriel.fullName, "You really thought you were the only one?");
        dialogue(gabriel.fullName, "I've loved you too, " + name + ".");
        narration(gabriel.fullName + " gently pulled you into a warm hug.");
        narration("You held him close under the beautiful moonlight.");
        dialogue(gabriel.fullName, "I love you.");
        dialogue(name, "I love you too, " + gabriel.nickname + ".");
        System.out.println("\n========== THE END <3 ==========");
    }

    void startStory()
    {
        chapter1();
        chapter2();
        chapter3();
        chapter4();
        chapter5();
    }
}

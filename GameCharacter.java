
public class GameCharacter
{
    String fullName;
    String nickname;
    String personality;
    String likes;
    String dislikes;
    String relationship;

    GameCharacter(String fullName, String nickname, String personality, String likes, String dislikes, String relationship)
    {
        this.fullName = fullName;
        this.nickname = nickname;
        this.personality = personality;
        this.likes = likes;
        this.dislikes = dislikes;
        this.relationship = relationship;
    }

    void showProfile()
    {
        System.out.println("\nCHARACTER PROFILE");
        System.out.println("Name: " + fullName);
        System.out.println("Nickname: " + nickname);
        System.out.println("Personality: " + personality);
        System.out.println("Likes: " + likes);
        System.out.println("Dislikes: " + dislikes);
        System.out.println("Relationship: " + relationship);
    }
}


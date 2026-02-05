# InkMatch - App Directory Listing

## App Name
InkMatch

## Short Description
Get AI-generated tattoo designs personalized to your style, meaning, and placement. See a preview instantly, then unlock 5 full designs with AR try-on for $0.99.

## Full Description
InkMatch is an AI tattoo design generator that creates personalized concepts based on what matters to you. Tell ChatGPT about the style you love, the meaning behind your tattoo, where you want it placed, and the vibe you're going for. InkMatch generates a preview design right in the conversation.

Unlike generic image generators, InkMatch is built specifically for tattoo design. It understands the difference between traditional bold lines and delicate minimalist work, between Japanese irezumi and geometric dotwork. The AI captures your preferences and generates flash-style artwork optimized for how real tattoos look.

**How it works:**
1. Describe your tattoo idea to ChatGPT (style, meaning, placement, vibe)
2. InkMatch generates a preview design based on your preferences
3. Like the direction? Get 5 full personalized designs for just $0.99
4. Use AR try-on to see designs on your actual body
5. Download and share with your tattoo artist

Perfect for first-timers who don't know where to start, or experienced collectors looking for fresh ideas. No more scrolling Pinterest for hours or struggling to describe your vision to artists.

## Category
Lifestyle

## Key Features
- **Instant AI preview** - See a design concept in seconds, not hours
- **Style-aware generation** - 12 distinct tattoo styles from Traditional to Biomechanical
- **Meaning-driven design** - Incorporates your personal symbolism and story
- **Placement optimization** - Designs suited for your chosen body location
- **AR body try-on** - See exactly how it looks on YOU before committing
- **Flash-ready output** - Clean designs your artist can work from
- **No subscription** - One-time $0.99 for 5 full designs

## How to Trigger

**Getting a design preview:**
- "Design a tattoo for me"
- "Generate a minimalist tattoo idea"
- "Show me what a Japanese style tattoo would look like"
- "I want a tattoo representing strength and resilience"
- "Create a tattoo design for my forearm"
- "Help me visualize a geometric tattoo"

**Exploring styles first:**
- "What tattoo styles are there?"
- "Help me pick a tattoo style"
- "What's the difference between traditional and neo-traditional tattoos?"
- "Recommend a tattoo style for someone who likes clean, minimal aesthetics"

**Key trigger phrases:** "design a tattoo," "generate a tattoo," "tattoo ideas," "show me a tattoo," "visualize a tattoo," "create a tattoo design"

## Country Availability
United States (initial launch)

## Data Handling
- Email collected only at point of purchase on inkmatch.io (for design delivery)
- No ChatGPT conversation data stored
- Preview images generated via Replicate API, not retained after session
- Full design generation and payment processing on inkmatch.io
- See full privacy policy: https://inkmatch.io/privacy

## Testing Guidelines for Reviewers

### Basic Flow
1. Start a new ChatGPT conversation with InkMatch enabled
2. Ask: "Design a minimalist tattoo representing growth and new beginnings"
3. Verify:
   - InkMatch generates and displays a preview image
   - Preference tags show your selections (style, meaning, etc.)
   - "Get 5 Full Designs" button links to inkmatch.io with params preserved
   - Features list displays (5 designs, AR try-on, etc.)

### Style Exploration
4. Ask: "What tattoo styles are there?"
5. Verify InkMatch returns a list of styles with descriptions
6. Ask: "Generate a Japanese style tattoo with koi fish"
7. Verify the preview reflects the Japanese style request

### Preference Capture
8. Ask: "I want a watercolor tattoo on my shoulder, something soft and peaceful, featuring butterflies"
9. Verify all preferences (watercolor, shoulder, soft, peaceful, butterflies) appear in tags
10. Click "Get 5 Full Designs" and verify URL contains query params

### Edge Cases
11. Ask for a style recommendation: "What style would suit someone who likes bold, graphic art?"
12. Verify InkMatch suggests appropriate styles (Blackwork, Traditional, etc.)
13. Test without specifying style: "Design a tattoo about family"
14. Verify InkMatch asks for clarification or picks a sensible default

### Mobile
15. Test on mobile viewport - verify widget is responsive and CTA is easily tappable

## Revenue Model
- Preview generation: Free (marketing cost ~$0.003 per preview)
- Full experience: $0.99 one-time on inkmatch.io
- No affiliate links, no ads - direct revenue from design purchases

## Contact
support@inkmatch.io
